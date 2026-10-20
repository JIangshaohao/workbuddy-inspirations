/**
 * index.html 端到端验收（CDP 驱动无头 Chrome）
 *
 * 为什么不用 chrome --screenshot：
 *   该命令只截视口，且不能执行页面脚本、读不到运行时状态。本页面的核心逻辑
 *   （管线、指标、导出）全在运行时，必须用 CDP 注入并读回。
 *
 * 验收口径（全部基于逐阶段实测指标，不是"看起来还行"）：
 *   1. 真实文件选择器路径可载入（DOM.setFileInputFiles 触发 change 事件）
 *   2. 去噪阶段：平区噪声显著下降（>50%）
 *   3. 去噪阶段：结构未被破坏（清晰度保留 >60%）
 *   4. 颜色通道未被错乱（暖偏 R−B 基本保持）—— 覆盖历史上出现过的平面/交错布局错位
 *   5. 色彩增强阶段：饱和度显著上升（>10%）
 *   6. 对比度：S 曲线不应引入额外高光裁剪（<5 个百分点）
 *   7. 锐化：相比去噪后清晰度上升（>20%）
 *   8. 平区掩膜非空（各阶段 flat_noise ≠ null）—— 覆盖历史上出现过的掩膜退化
 *   9. 零 JS 异常、无横向溢出
 *
 * 前置：先用 make_test_photo.py 生成测试素材。
 *
 * 用法：
 *   node tools/verify_page.js "tools/test-old.png" [chrome路径]
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const PAGE = 'file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/');
const TESTIMG = path.resolve(process.argv[2] || path.join(__dirname, 'test-old.png'));
const CHROME = process.argv[3] || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(p => fs.existsSync(p));
if (!CHROME) throw new Error('未找到 Chrome，请通过第二个参数指定可执行文件路径');

const PORT = 9350 + Math.floor(Math.random() * 40);
const W = 1512;
const OUTDIR = fs.mkdtempSync(path.join(os.tmpdir(), 'photo-verify-'));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const child = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run',
  '--no-default-browser-check', '--allow-file-access-from-files',
  `--remote-debugging-port=${PORT}`, `--window-size=${W},1000`, 'about:blank'], { stdio: 'ignore' });

(async () => {
  await sleep(2600);
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
  let id = 0; const pending = {}; const errors = [];
  const send = (m, p = {}) => new Promise(r => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; return; }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  };
  await new Promise(r => (ws.onopen = r));

  await send('Page.enable'); await send('Runtime.enable'); await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: PAGE });
  await sleep(1800);

  console.log(`页面  ${PAGE}\n素材  ${TESTIMG}\n`);

  const doc = await send('DOM.getDocument', { depth: -1 });
  const q = await send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: '#file' });
  if (!q.result?.nodeId) throw new Error('未找到 #file 节点 —— 页面结构可能已变更');
  await send('DOM.setFileInputFiles', { files: [TESTIMG], nodeId: q.result.nodeId });
  await sleep(1200);

  const t0 = Date.now();
  const runRes = await send('Runtime.evaluate', {
    expression: `(async()=>{try{ await run(); return JSON.stringify({ok:true,
        stages: state.stages.map(s=>({name:s.name,m:s.m})), flatBand: state.flatBand,
        workW: state.workW, workH: state.workH, elapsed: state.elapsed});}
      catch(e){ return JSON.stringify({ok:false,err:e&&e.message}); }})()`,
    awaitPromise: true, returnByValue: true });
  const out = JSON.parse(runRes.result.result.value);
  if (!out.ok) { console.log('管线执行失败：', out.err); throw new Error('run() failed'); }

  const texRef = out.stages[0].m.texture_energy;
  const ratio = s => (texRef && s.m.texture_energy) ? s.m.texture_energy / texRef : NaN;

  console.log('阶段'.padEnd(16) + '亮度'.padStart(9) + '饱和度'.padStart(9) + '平区噪声'.padStart(10) + '纹理保留'.padStart(10) + '清晰度'.padStart(10) + '裁剪率'.padStart(9) + '暖偏'.padStart(9));
  for (const s of out.stages) {
    const m = s.m;
    console.log(s.name.padEnd(16) + String(m.brightness_mean).padStart(9) + String(m.saturation_mean).padStart(9)
      + String(m.flat_noise).padStart(10) + ((ratio(s) * 100).toFixed(0) + '%').padStart(10)
      + String(m.sharpness_lapvar).padStart(10)
      + ((m.clip_frac * 100).toFixed(1) + '%').padStart(9) + String(m.warm_bias_r_minus_b).padStart(9));
  }
  console.log(`\n平区带 ${out.flatBand?.low}~${out.flatBand?.high}（占全图 ${(out.flatBand?.ratio * 100).toFixed(0)}%）· 输出 ${out.workW}x${out.workH} · 页内耗时 ${out.elapsed.toFixed(2)}s · 墙钟 ${((Date.now() - t0) / 1000).toFixed(2)}s`);

  const S = Object.fromEntries(out.stages.map(s => [s.name, s.m]));
  const orig = S['原图'], dn = S['① 去噪后'], sat = S['③ 色彩增强后'], fin = S['④ 锐化后'];
  const checks = [
    ['去噪：平区噪声下降 >50%', (1 - dn.flat_noise / orig.flat_noise) > 0.5, `${orig.flat_noise} -> ${dn.flat_noise}`],
    ['去噪：纹理保留 >85%（无塑料感）', ratio(out.stages[1]) > 0.85, `去噪后 ${(ratio(out.stages[1]) * 100).toFixed(0)}%`],
    ['去噪：暖偏未被错乱 (>80%)', dn.warm_bias_r_minus_b / orig.warm_bias_r_minus_b > 0.8, `${orig.warm_bias_r_minus_b} -> ${dn.warm_bias_r_minus_b}`],
    ['色彩：饱和度上升 >10%', sat.saturation_mean / dn.saturation_mean > 1.1, `${dn.saturation_mean} -> ${sat.saturation_mean}`],
    ['对比度：未增裁剪 (<5pp)', (fin.clip_frac - orig.clip_frac) * 100 < 5, `${(orig.clip_frac * 100).toFixed(1)}% -> ${(fin.clip_frac * 100).toFixed(1)}%`],
    ['锐化：比去噪后清晰 >20%', fin.sharpness_lapvar / sat.sharpness_lapvar > 1.2, `${sat.sharpness_lapvar} -> ${fin.sharpness_lapvar}`],
    ['平区掩膜非空', out.stages.every(s => s.m.flat_noise !== null), JSON.stringify(out.stages.map(s => s.m.flat_noise))],
    ['零 JS 异常', errors.length === 0, errors.length ? errors[0].slice(0, 160) : '无'],
  ];

  const ov = await send('Runtime.evaluate', { expression: `JSON.stringify({s:document.documentElement.scrollWidth,c:document.documentElement.clientWidth})`, returnByValue: true });
  const o = JSON.parse(ov.result.result.value);
  checks.push(['无横向溢出', o.s <= o.c + 1, `scrollW=${o.s} clientW=${o.c}`]);

  const md = await send('Runtime.evaluate', { expression: `buildMarkdown()`, returnByValue: true });
  fs.writeFileSync(path.join(OUTDIR, 'sample-report.md'), md.result.result.value, 'utf8');
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(OUTDIR, 'page-full.png'), Buffer.from(shot.result.data, 'base64'));

  console.log('\n验收');
  let allPass = true;
  for (const [n, ok, detail] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}   (${detail})`); if (!ok) allPass = false; }
  console.log(`\n产物：${OUTDIR}`);
  console.log('RESULT: ' + (allPass ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'));

  ws.close(); child.kill(); process.exit(allPass ? 0 : 2);
})().catch(e => { console.error('ERR', e.message); child.kill(); process.exit(1); });
