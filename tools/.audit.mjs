/* Temporary: drive headless Chrome over CDP to click every control on every
   page and report uncaught errors + controls that do nothing. */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const ROOT = process.cwd().replace(/\\/g, '/');
const BASE = 'file:///' + ROOT + '/';

const ROUTES = [
  'index.html',
  'shop.html',
  'product.html?slug=dior-sauvage-edp',
  'cart.html',
  'checkout.html',
  'order-confirmation.html',
  'recreate.html',
  'about.html',
  'contact.html'
];

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  '--user-data-dir=/tmp/jsaudit', '--remote-debugging-port=' + PORT,
  '--window-size=1440,1000', 'about:blank'
], { stdio: 'ignore' });

async function findTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === 'page');
      if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch (e) { /* not up yet */ }
    await sleep(250);
  }
  throw new Error('Chrome did not expose a debugging target');
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        this.listeners.forEach((fn) => fn(msg));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  on(fn) { this.listeners.push(fn); }
}

const AUDIT = `(async () => {
  const errors = [];
  const onClick = (e) => { const a = e.target.closest && e.target.closest('a'); if (a && (a.getAttribute('href')||'').indexOf('#') !== 0) e.preventDefault(); };
  document.addEventListener('click', onClick, true);
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const els = [...document.querySelectorAll('button, [data-quick-add], [data-wish], [data-add], [data-rail-prev], [data-rail-next], [data-suggest], [data-goto], [data-next], [data-open-nav], [data-close-nav], [data-open-account], [data-close-account], [data-open-cart], [data-close-drawer], [data-open-search], [data-close-search], [data-close-announce], .fgroup__head, .acc__head')];
  const seen = new Set();
  const fails = [];
  let tested = 0;
  for (const el of els) {
    if (el.offsetParent === null && el.tagName !== 'BODY') continue;
    const label = (el.getAttribute('data-quick-add') && 'quick-add:' + el.getAttribute('data-quick-add'))
      || (el.getAttribute('data-wish') && 'wish:' + el.getAttribute('data-wish'))
      || (el.getAttribute('data-add') && 'add:' + el.getAttribute('data-add'))
      || el.textContent.trim().slice(0, 30)
      || el.className;
    if (seen.has(label)) continue;
    seen.add(label);
    const before = document.body.innerHTML.length + '|' + document.body.className + '|' + location.hash;
    let threw = null;
    try { el.click(); } catch (err) { threw = String(err && err.message); }
    await wait(45);
    const after = document.body.innerHTML.length + '|' + document.body.className + '|' + location.hash;
    tested++;
    if (threw) fails.push(label + '  THREW: ' + threw);
    else if (before === after) fails.push(label + '  no visible effect');
    // tidy up anything we opened
    document.body.classList.remove('drawer-open','search-open','nav-open','account-open','modal-open','is-locked');
  }
  document.removeEventListener('click', onClick, true);
  return { tested, fails };
})()`;

const errors = [];
let ws;
try {
  const url = await findTarget();
  ws = new WebSocket(url);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const cdp = new CDP(ws);
  cdp.on((msg) => {
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      errors.push('EXCEPTION ' + (d.exception && d.exception.description || d.text));
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push('CONSOLE ' + msg.params.args.map((a) => a.value || a.description || '').join(' '));
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      errors.push('LOG ' + msg.params.entry.text);
    }
  });
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Page.enable');

  let totalFails = 0;
  for (const route of ROUTES) {
    errors.length = 0;
    await cdp.send('Page.navigate', { url: BASE + route });
    await sleep(1600);
    const res = await cdp.send('Runtime.evaluate', { expression: AUDIT, awaitPromise: true, returnByValue: true });
    const val = res.result.value || { tested: 0, fails: ['audit did not run'] };
    const real = errors.filter((e) => !/file: URLs are treated as unique/.test(e));
    console.log('\n=== ' + route);
    console.log('    controls tested: ' + val.tested + '   uncaught errors: ' + real.length);
    real.slice(0, 6).forEach((e) => console.log('    ! ' + e));
    val.fails.forEach((f) => console.log('    - ' + f));
    totalFails += val.fails.length;
  }
  console.log('\nTOTAL dead controls: ' + totalFails);
} finally {
  try { if (ws) ws.close(); } catch (e) {}
  chrome.kill();
}
