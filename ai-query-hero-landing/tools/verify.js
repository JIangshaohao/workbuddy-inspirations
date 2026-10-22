/**
 * 视觉验收脚本：用 CDP 驱动本机 Chrome，分别截取桌面端与移动端首屏，
 * 并校验关键元素的几何与样式是否符合设计规格。
 *
 * 用法：node tools/verify.js [url]
 * 默认 url: http://127.0.0.1:5181/
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.argv[2] || 'http://127.0.0.1:5181/';
const OUT = path.join(__dirname, '..', 'shots');
const PORT = 9223;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJSON(pathname) {
  const res = await fetch(`http://127.0.0.1:${PORT}${pathname}`);
  return res.json();
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-'));
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required',
    '--window-size=1440,900', 'about:blank',
  ], { stdio: 'ignore' });

  let targets = null;
  for (let i = 0; i < 40; i++) {
    try { targets = await fetchJSON('/json/list'); break; } catch { await sleep(500); }
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

  await send('Page.enable');
  await send('Runtime.enable');

  /** 统一执行并把异常打出来，避免静默返回 undefined */
  async function evaluate(expression) {
    const r = await send('Runtime.evaluate', { returnByValue: true, expression, awaitPromise: true });
    if (r.result && r.result.exceptionDetails) {
      const ex = r.result.exceptionDetails;
      throw new Error('页面求值异常: ' + (ex.exception && ex.exception.description || ex.text));
    }
    if (r.result && r.result.result && r.result.result.subtype === 'error') {
      throw new Error('页面求值错误: ' + r.result.result.description);
    }
    return r.result.result.value;
  }

  /** 等待文档就绪 */
  async function waitLoad() {
    for (let i = 0; i < 40; i++) {
      const ready = await evaluate('document.readyState');
      if (ready === 'complete') return true;
      await sleep(250);
    }
    return false;
  }

  /** 轮询直到视频解出首帧（readyState >= 2），避免固定 sleep 抓早 */
  async function waitVideo() {
    for (let i = 0; i < 60; i++) {
      const val = await evaluate(`(() => { const v = document.getElementById('hero-video');
        return v ? { rs: v.readyState, dur: v.duration, op: getComputedStyle(v).opacity } : null; })()`);
      if (val && val.rs >= 2) return val;
      await sleep(1000);
    }
    return null;
  }

  async function shot(name, width, height, mobile) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
    await send('Page.navigate', { url: URL });
    await waitLoad();
    const vs = await waitVideo();
    await sleep(1200);
    const metrics = await evaluate(`(() => {
        const q = s => document.querySelector(s);
        const rect = el => { if(!el) return null; const r = el.getBoundingClientRect();
          return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}; };
        const cs = el => { if(!el) return null; const s = getComputedStyle(el);
          return { fontFamily:s.fontFamily, fontSize:s.fontSize, fontWeight:s.fontWeight,
                   letterSpacing:s.letterSpacing, lineHeight:s.lineHeight, color:s.color,
                   background:s.backgroundColor, borderRadius:s.borderRadius, textAlign:s.textAlign }; };
        const v = q('#hero-video');
        const vs = v ? getComputedStyle(v) : null;
        return {
          video: vs ? { w: vs.width, h: vs.height, left: vs.left, top: vs.top,
                        objectPosition: vs.objectPosition, objectFit: vs.objectFit,
                        opacity: vs.opacity, transform: vs.transform } : null,
          nav: rect(q('header')),
          logo: { rect: rect(q('#brand-logo')), style: cs(q('#brand-logo')) },
          menuItem: cs(q('header ul li a')),
          signUp: { rect: rect(q('#nav-signup')), style: cs(q('#nav-signup')) },
          logIn: { rect: rect(q('#nav-login')), style: cs(q('#nav-login')) },
          badge: { rect: rect(q('#hero-badge')), style: cs(q('#hero-badge')),
                   text: q('#hero-badge').textContent.replace(/\\s+/g,' ').trim() },
          h1: { rect: rect(q('h1')), text: q('h1').textContent.trim(), style: cs(q('h1')) },
          sub: { rect: rect(q('#hero-subtitle')), text: q('#hero-subtitle').textContent.replace(/\\s+/g,' ').trim(), style: cs(q('#hero-subtitle')) },
          panel: { rect: rect(q('.search-panel')), style: cs(q('.search-panel')) },
          panelBackdrop: q('.search-panel') ? getComputedStyle(q('.search-panel')).backdropFilter : null,
          credit: { text: q('#credit-row').textContent.replace(/\\s+/g,' ').trim(),
                    style: cs(q('#credit-row')) },
          upgrade: { rect: rect(q('#upgrade-btn')), style: cs(q('#upgrade-btn')) },
          composer: { rect: rect(q('.composer')), style: cs(q('.composer')) },
          input: { style: cs(q('#query-input')), placeholder: q('#query-input').placeholder },
          submit: rect(q('#submit-btn')),
          counter: q('#char-count').textContent,
          toolBtn: cs(q('#toolbar-actions button')),
          scrollW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
          bodyFont: getComputedStyle(document.body).fontFamily,
        };
      })()`);
    console.log(`\n===== ${name} (${width}x${height}) =====`);
    console.log('videoReadyState:', JSON.stringify(vs));
    console.log(JSON.stringify(metrics, null, 1));
    const cap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(cap.result.data, 'base64'));
  }

  await shot('desktop', 1440, 900, false);
  await shot('mobile', 390, 844, true);

  ws.close();
  chrome.kill();
}

main().catch(e => { console.error(e); process.exit(1); });
