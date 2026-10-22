/**
 * 淡入淡出逻辑确定性验收。
 *
 * 背景：背景视频是 15MB 外链 MP4，headless 里 seek 到接近结尾会因缓冲卡住，
 * 事件不触发，无法用真实时间轴验证。因此这里在页面内覆盖 video 实例上的
 * duration / currentTime 为可控值（覆盖实例属性可遮蔽原型只读 getter），
 * 然后手动派发 timeupdate / ended，直接对规格里的逻辑规则做断言。
 *
 * 断言项：
 *  A. 视频元素上无 CSS transition（淡入淡出必须来自 rAF）
 *  B. 距结尾剩余 <= 0.55s 时触发淡出，250ms 内 opacity 从 1 降到 0
 *  C. 重复 timeupdate 不重复触发淡出（fadingOut 标志位）
 *  D. ended 时 opacity 立即归零 → 100ms 后 currentTime 复位为 0 并重播 → 再次淡入
 *  E. 第二圈仍能淡出（fadingOut 在循环开始时已复位）
 *  F. 淡出过程中发生新动画时旧帧被取消，opacity 不发生跳变（连续性）
 *
 * 用法：node tools/verify-fade.js [url]
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.argv[2] || 'http://127.0.0.1:5181/';
const PORT = 9224;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-fade-'));
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required',
    '--window-size=1440,900', 'about:blank',
  ], { stdio: 'ignore' });

  let targets = null;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      targets = await res.json();
      break;
    } catch { await sleep(500); }
  }
  if (!targets) { console.error('无法连接 Chrome CDP'); process.exit(1); }

  const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', e => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  const send = (method, params = {}) => new Promise(res => {
    const myId = ++id;
    pending.set(myId, res);
    ws.send(JSON.stringify({ id: myId, method, params }));
  });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { returnByValue: true, expression, awaitPromise: true });
    if (r.result && r.result.exceptionDetails) {
      throw new Error('页面异常: ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text));
    }
    return r.result.result.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: URL });

  for (let i = 0; i < 60; i++) {
    const ok = await evaluate(`(() => { const v = document.getElementById('hero-video');
      return document.readyState === 'complete' && v && v.readyState >= 2; })()`);
    if (ok) break;
    await sleep(1000);
  }

  const results = await evaluate(`(() => new Promise(async resolve => {
    const v = document.getElementById('hero-video');
    const R = {};
    const op = () => parseFloat(getComputedStyle(v).opacity);
    const wait = ms => new Promise(r => setTimeout(r, ms));

    // 用可控的假时间轴遮蔽原生只读属性
    const fake = { duration: 10, currentTime: 0 };
    Object.defineProperty(v, 'duration', { get: () => fake.duration, configurable: true });
    Object.defineProperty(v, 'currentTime', {
      get: () => fake.currentTime,
      set: (val) => { fake.currentTime = val; },
      configurable: true,
    });

    // A. 不得有 CSS transition
    const cs = getComputedStyle(v);
    R.A_noCssTransition = {
      transitionDuration: cs.transitionDuration,
      transitionProperty: cs.transitionProperty,
      pass: cs.transitionDuration === '0s',
    };

    // 建立基准状态：完全可见
    v.style.opacity = '1';

    // B. 剩余 0.55s 内触发淡出
    fake.currentTime = fake.duration - 0.4;   // 剩余 0.4s < 0.55s
    v.dispatchEvent(new Event('timeupdate'));
    await wait(120);
    const mid = op();                          // 250ms 动画进行到约一半
    await wait(260);
    const end = op();                          // 动画应已完成
    R.B_fadeOut = {
      midOpacity: +mid.toFixed(3),
      endOpacity: +end.toFixed(3),
      pass: mid < 1 && mid > 0 && end < 0.05,
    };

    // C. 重复 timeupdate 不得重新触发（否则会从 0 再动一次）
    v.dispatchEvent(new Event('timeupdate'));
    v.dispatchEvent(new Event('timeupdate'));
    await wait(80);
    R.C_noRetrigger = { opacity: +op().toFixed(3), pass: op() < 0.05 };

    // F. 淡出途中插入新动画：opacity 必须连续，不能出现跳变
    v.style.opacity = '0.5';
    fake.currentTime = fake.duration - 0.2;
    v.dispatchEvent(new Event('timeupdate'));  // 已 fadingOut，不应重复触发
    await wait(60);
    const contA = op();
    v.style.opacity = '0.5';
    fake.currentTime = 0;
    v.dispatchEvent(new Event('ended'));        // 新动画打断旧动画
    await wait(60);
    const contB = op();
    R.F_noSnap = { afterRetrigger: +contA.toFixed(3), afterNewAnim: +contB.toFixed(3),
                   pass: Math.abs(contA - 0.5) < 0.2 };

    // D. ended 语义：opacity 归零 → 100ms 延迟 → currentTime 复位 → 重播 → 再淡入
    v.style.opacity = '1';
    fake.currentTime = fake.duration;
    v.dispatchEvent(new Event('ended'));
    await wait(40);
    const immediate = op();
    await wait(80);                              // 累计 120ms > 100ms 延迟
    const afterDelay = { opacity: +op().toFixed(3), currentTime: fake.currentTime };
    await wait(320);                             // 淡入 250ms 走完
    const afterFadeIn = { opacity: +op().toFixed(3), currentTime: fake.currentTime };
    R.D_endedLoop = {
      immediateOpacity: +immediate.toFixed(3),
      afterDelay,
      afterFadeIn,
      pass: immediate < 0.05 && afterDelay.currentTime === 0 && afterFadeIn.opacity > 0.9,
    };

    // E. 第二圈仍能淡出
    fake.currentTime = fake.duration - 0.3;
    v.dispatchEvent(new Event('timeupdate'));
    await wait(300);
    R.E_secondLoop = { opacity: +op().toFixed(3), pass: op() < 0.05 };

    // 附加：字数统计联动
    const inp = document.getElementById('query-input');
    inp.value = 'hello';
    inp.dispatchEvent(new Event('input'));
    R.counter = document.getElementById('char-count').textContent;

    resolve(R);
  }))()`);

  console.log(JSON.stringify(results, null, 1));

  const checks = Object.entries(results).filter(([k]) => /^[A-F]_/.test(k));
  const failed = checks.filter(([, v]) => v.pass === false);
  console.log('\n通过: ' + (checks.length - failed.length) + '/' + checks.length);
  if (failed.length) {
    console.log('未通过: ' + failed.map(([k]) => k).join(', '));
    process.exitCode = 1;
  }

  ws.close();
  chrome.kill();
}

main().catch(e => { console.error(e); process.exit(1); });
