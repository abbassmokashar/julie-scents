/* Temporary: stateful assertions for cart qty, coupon, and the account panel. */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9334;
const BASE = 'file:///' + process.cwd().replace(/\\/g, '/') + '/';

const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  '--user-data-dir=/tmp/jscart', '--remote-debugging-port=' + PORT, '--window-size=1440,1000', 'about:blank'], { stdio: 'ignore' });

async function target() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = list.find((t) => t.type === 'page');
      if (p) return p.webSocketDebuggerUrl;
    } catch (e) {}
    await sleep(250);
  }
  throw new Error('no target');
}

const wsUrl = await target();
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });
let id = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id); pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
});
const send = (method, params = {}) => new Promise((res, rej) => { pending.set(++id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;

await send('Runtime.enable');
await send('Page.enable');

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); };

/* seed a cart, then reload the cart page */
await send('Page.navigate', { url: BASE + 'index.html' });
await sleep(1200);
await evalJs(`localStorage.clear(); localStorage.setItem('julie.cart.v1', JSON.stringify([
  { id: 1, slug: 'dior-sauvage-edp', ml: 50, qty: 1, variant: 'original' }
])); 'ok'`);

await send('Page.navigate', { url: BASE + 'cart.html' });
await sleep(1600);

const before = await evalJs(`(() => {
  const q = document.querySelector('[data-qty] .qty__val');
  const sub = [...document.querySelectorAll('.summary__row, .cart-summary *')].map(e=>e.textContent).join('|');
  return { qty: q && q.textContent, body: document.body.innerText.replace(/\\s+/g,' ').slice(0,400) };
})()`);
check('cart line renders', /Sauvage/.test(before.body), before.body.slice(0, 120));

const afterPlus = await evalJs(`(async () => {
  const plus = document.querySelector('[data-qty] [data-step="1"]');
  if (!plus) return { err: 'no + button' };
  plus.click();
  await new Promise(r => setTimeout(r, 250));
  const q = document.querySelector('[data-qty] .qty__val');
  const stored = JSON.parse(localStorage.getItem('julie.cart.v1'));
  return { qty: q && q.textContent, storedQty: stored && stored[0] && stored[0].qty, body: document.body.innerText.replace(/\\s+/g,' ') };
})()`);
check('qty + increments DOM', afterPlus.qty === '2', 'qty=' + afterPlus.qty);
check('qty + persists', afterPlus.storedQty === 2, 'stored=' + afterPlus.storedQty);
check('subtotal updates', /\$66|66\.00/.test(afterPlus.body || ''), (afterPlus.body || '').match(/\$[\d.,]+/g));

const coupon = await evalJs(`(async () => {
  const f = document.querySelector('form[data-coupon], #couponForm, form');
  const i = document.querySelector('#couponInput, input[name="coupon"]');
  if (!i) return { err: 'no coupon input' };
  i.value = 'WELCOME10';
  const btn = document.querySelector('[data-apply-coupon]') || (f && f.querySelector('button'));
  if (btn) btn.click(); else if (f) f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true}));
  await new Promise(r => setTimeout(r, 300));
  return { body: document.body.innerText.replace(/\\s+/g,' '), coupon: localStorage.getItem('julie.coupon.v1') };
})()`);
check('coupon applies', /WELCOME10|10%|discount/i.test(coupon.body || ''), coupon.coupon);

await send('Page.navigate', { url: BASE + 'index.html' });
await sleep(1200);
const acct = await evalJs(`(async () => {
  const btn = document.querySelector('[data-open-account]');
  if (!btn) return { err: 'no account button' };
  btn.click();
  await new Promise(r => setTimeout(r, 300));
  const panel = document.getElementById('accountPanel');
  return { open: document.body.classList.contains('account-open'), text: panel ? panel.innerText.replace(/\\s+/g,' ').slice(0,300) : null };
})()`);
check('account panel opens', acct.open === true, acct.err || '');
check('account shows saved/help', /Saved fragrances|Help/i.test(acct.text || ''), (acct.text || '').slice(0, 140));

const closeAcc = await evalJs(`(async () => {
  document.querySelector('[data-close-account]').click();
  await new Promise(r => setTimeout(r, 250));
  return document.body.classList.contains('account-open');
})()`);
check('account panel closes', closeAcc === false, '');

console.log('');
let fails = 0;
for (const r of results) {
  if (!r.ok) fails++;
  console.log((r.ok ? '  PASS  ' : '  FAIL  ') + r.name + (r.detail ? '   [' + r.detail + ']' : ''));
}
console.log('\n' + (results.length - fails) + ' passed, ' + fails + ' failed');
ws.close();
chrome.kill();
