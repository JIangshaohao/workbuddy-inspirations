/**
 * 视觉验收脚本：用 CDP 驱动本机 Chrome，分别截取桌面端与移动端首屏，
 * 并校验关键元素的几何与样式是否符合规格。
 *
 * 用法：node tools/verify.js
 * 前置：本机 Chrome 已启动且开启 --remote-debugging-port=9222，或由本脚本自行拉起。
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.argv[2] || 'http://127.0.0.1:5180/';
const OUT = path.join(__dirname, '..', 'shots');
const PORT = 9222;

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

  /** 轮询直到视频至少解出首帧（readyState >= 2），避免固定 sleep 抓早 */
  async function waitVideo() {
    for (let i = 0; i < 60; i++) {
      const r = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => { const v = document.getElementById('hero-video');
          return v ? v.readyState : -1; })()`,
      });
      if (r.result.result.value >= 2) return;
      await sleep(1000);
    }
  }

  async function shot(name, width, height, mobile) {
    await send('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: 1, mobile,
    });
    await send('Page.navigate', { url: URL });
    await waitVideo();
    await sleep(800);
    const metrics = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const q = s => document.querySelector(s);
        const rect = el => { if(!el) return null; const r = el.getBoundingClientRect();
          return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}; };
        const cs = el => { if(!el) return null; const s = getComputedStyle(el);
          return {display:s.display, opacity:s.opacity, fontSize:s.fontSize, fontFamily:s.fontFamily,
                  color:s.color, background:s.backgroundColor, textTransform:s.textTransform}; };
        return {
          nav: rect(q('.navbar')), navScrolled: q('.navbar').classList.contains('navbar--scrolled'),
          logo: rect(q('.navbar__logo')), wordmark: cs(q('.navbar__wordmark')),
          cta: cs(q('.navbar__cta')), links: cs(q('.navbar__links')),
          hamburger: cs(q('.hamburger')), menu: cs(q('.mobile-menu')),
          hero: rect(q('.hero')), video: rect(q('.hero__video')),
          videoPos: getComputedStyle(q('.hero__video')).objectPosition,
          pill: rect(q('.pill')), pillText: q('.pill__text').textContent.trim(),
          h1: rect(q('.hero__headline')), h1Text: q('.hero__headline').textContent.replace(/\\s+/g,' ').trim(),
          h1Font: cs(q('.hero__headline')),
          trusted: rect(q('.trusted')), label: q('.trusted__label').textContent.trim(),
          logos: [...document.querySelectorAll('.trusted__logo')].map(e => ({
            t: e.textContent.trim(), f: getComputedStyle(e).fontFamily, s: getComputedStyle(e).fontSize })),
          bodyFont: getComputedStyle(document.body).fontFamily,
          scrollW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
        };
      })()`,
    });
    console.log(`\n===== ${name} (${width}x${height}) =====`);
    console.log(JSON.stringify(metrics.result.result.value, null, 1));
    const cap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(cap.result.data, 'base64'));
  }

  await shot('desktop', 1440, 900, false);
  await shot('tablet', 768, 1024, false);
  await shot('mobile', 390, 844, true);

  // 移动端菜单展开态
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: URL });
  await waitVideo();
  await sleep(500);
  await send('Runtime.evaluate', { expression: `document.getElementById('menu-toggle').click()` });
  await sleep(1200);
  const cap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT, 'mobile-menu.png'), Buffer.from(cap.result.data, 'base64'));
  const st = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `({ bodyOverflow: document.body.style.overflow, open: document.getElementById('mobile-menu').classList.contains('is-open'), opacity: getComputedStyle(document.getElementById('mobile-menu')).opacity })`,
  });
  console.log('\n===== mobile menu open =====');
  console.log(JSON.stringify(st.result.result.value, null, 1));

  ws.close();
  chrome.kill();
}

main().catch(e => { console.error(e); process.exit(1); });
