// 페이지 사이를 넘어갈 때 빨강·검정 막이 덮였다가 걷히는 전환. 홈과 모든 견본 페이지가 함께 쓴다.
const KEY = 'pulsr-tx'
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const EASE = 'cubic-bezier(.76,0,.24,1)'

function cover() {
  let el = document.querySelector('.tx')
  if (el) return el
  el = document.createElement('div')
  el.className = 'tx'
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML = '<i class="tx-r"></i><i class="tx-b"><b>PULS<em>R</em></b></i>'
  const css = document.createElement('style')
  css.textContent = `.tx{position:fixed;inset:0;z-index:9999;pointer-events:none}
.tx i{position:absolute;inset:0;transform:scaleY(0);transform-origin:50% 100%}
.tx-r{background:#f51c20}.tx-b{background:#0a0a0a;display:grid;place-items:center}
.tx-b b{font:900 clamp(28px,4vw,44px)/1 'Noto Sans KR',system-ui,sans-serif;letter-spacing:.04em;color:#f7f7f2;opacity:0}
.tx-b em{font-style:normal;color:#f51c20}.tx.on{pointer-events:all}`
  document.head.appendChild(css)
  document.body.appendChild(el)
  return el
}

function leave(href) {
  const el = cover(); el.classList.add('on')
  const [r, b] = el.querySelectorAll('i')
  const o = { duration: 520, easing: EASE, fill: 'forwards' }
  r.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], o)
  b.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { ...o, delay: 110 })
  b.firstChild.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 420, fill: 'forwards' })
  try { sessionStorage.setItem(KEY, '1') } catch {}
  setTimeout(() => { location.href = href }, 700)
}

function enter() {
  let flag = null
  try { flag = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY) } catch {}
  if (!flag || reduce) return false
  const el = cover()
  const [r, b] = el.querySelectorAll('i')
  r.style.transform = b.style.transform = 'scaleY(1)'
  b.firstChild.style.opacity = 1
  const o = { duration: 620, easing: EASE, fill: 'forwards' }
  requestAnimationFrame(() => {
    b.firstChild.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' })
    b.style.transformOrigin = r.style.transformOrigin = '50% 0'
    b.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { ...o, delay: 120 })
    r.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { ...o, delay: 230 })
  })
  return true
}

// 돌려주는 값: 다른 페이지에서 전환을 타고 들어왔는지(홈은 이때 인트로를 건너뛴다).
export function initTransitions() {
  // 견본이 홈 안 미리보기(iframe)로 열렸을 땐 전환을 쓰지 않는다.
  if (window.top !== window) return false
  const entered = enter()
  window.addEventListener('pageshow', (e) => { if (e.persisted) document.querySelector('.tx')?.remove() })
  if (reduce) return entered
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = e.target.closest('a[href]')
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return
    const u = new URL(a.href, location.href)
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return
    if (/\.(html|pdf|jpg|png|mp4)$/.test(u.pathname) && !u.pathname.endsWith('index.html')) return
    e.preventDefault()
    leave(u.href)
  })
  return entered
}
