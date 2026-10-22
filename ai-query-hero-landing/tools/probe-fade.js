/**
 * 淡入淡出曲线探针：在页面内以 40ms 间隔连续采样 video 的 opacity / currentTime / paused，
 * 输出全量数据，用于确认「淡出 → 归零 → 重播 → 再淡入」四个阶段是否按规格发生。
 *
 * 用法：node tools/probe-fade.js [url]
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.argv[2] || 'http://127.0.0.1:5181/';
const PORT = 9225;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-probe-'));
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

  const res = await evaluate(`(() => new Promise(resolve => {
    const v = document.getElementById('hero-video');
    const out = [];
    const events = [];
    ['ended', 'timeupdate', 'play', 'pause', 'seeked'].forEach(name => {
      v.addEventListener(name, () => events.push({ name, t: Math.round(performance.now()), ct: +v.currentTime.toFixed(2) }));
    });
    const t0 = performance.now();
    const timer = setInterval(() => {
      out.push({
        t: Math.round(performance.now() - t0),
        op: +parseFloat(getComputedStyle(v).opacity).toFixed(3),
        ct: +v.currentTime.toFixed(2),
        ended: v.ended,
        paused: v.paused,
      });
      if (performance.now() - t0 > 4000) {
        clearInterval(timer);
        resolve({ samples: out, events, duration: v.duration });
      }
    }, 40);
    v.currentTime = Math.max(0, v.duration - 1.2);
    v.play().catch(() => {});
  }))()`);

  console.log('duration =', res.duration, ' sampleCount =', res.samples.length);
  console.log('\n--- 关键事件 ---');
  for (const e of res.events) {
    if (e.name === 'timeupdate') continue;   // 太多，只看非 timeupdate
    console.log(`${String(e.t).padStart(5)}ms  ${e.name.padEnd(8)} ct=${e.ct}`);
  }
  const tu = res.events.filter(e => e.name === 'timeupdate');
  console.log(`timeupdate 事件数: ${tu.length}`);
  if (tu.length) {
    console.log('最后 3 个 timeupdate:', JSON.stringify(tu.slice(-3)));
  }

  console.log('\n--- 采样序列（每 4 条取 1 条）---');
  console.log('t(ms)\topacity\tcurrentTime\tended\tpaused');
  res.samples.forEach((s, i) => {
    if (i % 4 === 0 || s.ended) {
      console.log(`${String(s.t).padStart(5)}  ${String(s.op).padEnd(7)} ${String(s.ct).padEnd(11)} ${String(s.ended).padEnd(6)} ${s.paused}`);
    }
  });

  const ops = res.samples.map(s => s.op);
  console.log('\nmin opacity =', Math.min(...ops), ' max =', Math.max(...ops));

  ws.close();
  chrome.kill();
}

main().catch(e => { console.error(e); process.exit(1); });
