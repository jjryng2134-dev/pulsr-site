import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Preview, Levels, Estimate, Contact, Compare, Faq, useFilter } from './Sections.jsx'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const WORKS = [
  { id: 'cafe', tags: ['주문'], name: '온결 커피', biz: '카페·베이커리', feat: '메뉴 담기 → 픽업 시간 → 주문서', tech: ['React', 'GSAP'], href: '/work/cafe/', ready: true, thumb: '/work/cafe/img/cafe_hero.jpg' },
  { id: 'clinic', tags: ['예약'], name: '맑은결 피부과', biz: '피부과·치과', feat: '남은 자리 보이는 예약 달력 → 알림톡 미리보기', tech: ['React', 'GSAP'], href: '/work/clinic/', ready: true, thumb: '/work/clinic/img/clinic_hero.jpg' },
  { id: 'interior', tags: ['견적·진단', '3D'], name: '오롯 인테리어', biz: '시공·리모델링', feat: '3D 방 재질 바꾸기, 전후 비교, 평수 견적', tech: ['Three.js', 'React', 'GSAP'], href: '/work/interior/', ready: true, thumb: '/work/interior/img/int_hero.jpg' },
  { id: 'academy', tags: ['견적·진단'], name: '한걸음 수학', biz: '학원·교습소', feat: '3분 레벨 진단, 약한 단원 분석, 남은 자리 시간표', tech: ['React', 'GSAP'], href: '/work/academy/', ready: true, thumb: '/work/academy/img/aca_hero.jpg' },
  { id: 'detail', tags: ['주문', '스크롤 연출'], name: '아침결 그래놀라', biz: '쇼핑 상세페이지', feat: '스크롤로 펼쳐지는 사진, 옵션·수량·배송비 계산, 장바구니', tech: ['GSAP', 'React'], href: '/work/detail/', ready: true, thumb: '/work/detail/img/gr1_hero.jpg' },
  { id: 'class', tags: ['예약'], name: '원데이 클래스', biz: '공방·클래스', feat: '남은 자리 있는 날짜로 예약', tech: ['React'] },
]

function useAutoScroll(ref, active) {
  // 같은 사이트 안 견본이라 iframe 안을 직접 천천히 스크롤해 '살아 있는 화면'을 보여 준다.
  useEffect(() => {
    if (!active || reduce) return
    const f = ref.current
    let raf, y = 0, dir = 1, pause = 120, last = performance.now()
    const tick = (t) => {
      const dt = Math.min(48, t - last); last = t
      try {
        const w = f.contentWindow, max = w.document.documentElement.scrollHeight - w.innerHeight
        if (pause > 0) pause -= dt / 16
        else {
          y += dir * dt * 0.06
          if (y >= max) { y = max; dir = -1; pause = 90 }
          if (y <= 0) { y = 0; dir = 1; pause = 120 }
          w.scrollTo({ top: y, behavior: 'instant' })
        }
      } catch {}
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])
}


const TOUR_STEPS = ['메뉴 담기', '옵션 고르기', '픽업 시간', '주문 완료']

// PC 화면 안에서 가짜 커서가 카페 견본을 실제로 눌러 주문까지 끝내는 시연. 같은 사이트라 iframe 안을 직접 조작한다.
function useTour(frame, cursor, active, onStep) {
  useEffect(() => {
    if (!active || reduce) return
    let alive = true
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    const doc = () => frame.current.contentWindow.document
    const win = () => frame.current.contentWindow
    const scale = () => frame.current.getBoundingClientRect().width / 1440
    const q = (sel) => doc().querySelector(sel)
    async function moveTo(el, click = true) {
      if (!el || !alive) return
      const r = el.getBoundingClientRect(), s = scale()
      gsap.to(cursor.current, { x: (r.left + r.width / 2) * s, y: (r.top + r.height / 2) * s, duration: 0.9, ease: 'power3.inOut' })
      await sleep(950)
      if (!click || !alive) return
      cursor.current.classList.remove('tap'); void cursor.current.offsetWidth; cursor.current.classList.add('tap')
      await sleep(160)
      el.click()
    }
    function typeInto(el, text) {
      const set = Object.getOwnPropertyDescriptor(win().HTMLInputElement.prototype, 'value').set
      return (async () => {
        for (let i = 1; i <= text.length && alive; i++) {
          set.call(el, text.slice(0, i)); el.dispatchEvent(new (win().Event)('input', { bubbles: true }))
          await sleep(90)
        }
      })()
    }
    function scrollTo(y) {
      const w = win(), from = w.scrollY, o = { v: from }
      return new Promise((res) => gsap.to(o, { v: y, duration: 1.4, ease: 'power2.inOut', onUpdate: () => w.scrollTo({ top: o.v, behavior: 'instant' }), onComplete: res }))
    }
    ;(async () => {
      while (alive) {
        try {
          onStep(-1)
          gsap.set(cursor.current, { x: 1100 * scale(), y: 520 * scale(), opacity: 1 })
          await sleep(1600)
          await scrollTo(q('#menu').offsetTop - 70)
          onStep(0); await moveTo(q('.card .add')); await sleep(700)
          onStep(1); await moveTo(q('.seg button:last-child')); await sleep(400)
          await moveTo(q('.opt.check input')); await sleep(400)
          await moveTo(q('.sheet .btn')); await sleep(700)
          await moveTo(q('.dock')); await sleep(800)
          onStep(2); await moveTo(q('.slots button:nth-child(3)')); await sleep(300)
          await moveTo(q('#ck-name')); await typeInto(q('#ck-name'), '김한결'); await sleep(200)
          await moveTo(q('#ck-phone')); await typeInto(q('#ck-phone'), '01012345678'); await sleep(300)
          await moveTo(q('.drawer .btn[type=submit]')); await sleep(400)
          onStep(3); await sleep(2600)
          await moveTo(q('.done .btn')); await sleep(500)
          await scrollTo(0); await sleep(600)
        } catch { await sleep(1500) }
      }
    })()
    return () => { alive = false }
  }, [active])
}


// 첫 화면 영상(견본 5종 실제 사용 장면 녹화) 구간. 시간은 public/home/reel.mp4 기준.
const CHAPTERS = [
  { at: 0, t: '카페 · 픽업 주문', href: '/work/cafe/' },
  { at: 4.25, t: '상세페이지 · 스크롤 연출', href: '/work/detail/' },
  { at: 9.45, t: '인테리어 · 전후 비교와 3D', href: '/work/interior/' },
  { at: 15.98, t: '피부과 · 예약', href: '/work/clinic/' },
  { at: 20.18, t: '학원 · 레벨 진단', href: '/work/academy/' },
]

// 아래로 내려가는 이야기: 보고 → 써 보고 → 값 매기고 → 맡기기
const STORY = [
  { id: 'see', n: '01', t: '보고', en: 'See', d: '업종별 견본부터 둘러보세요. 마음에 드는 게 있으면 눌러서 들어가 보시면 돼요.' },
  { id: 'try', n: '02', t: '써 보고', en: 'Try', d: '보는 것과 써 보는 건 달라요. 손님이 실제로 누르는 화면을 직접 만져 보세요.' },
  { id: 'price', n: '03', t: '값 매기고', en: 'Price', d: '필요한 기능만 고르면 금액과 기간이 바로 나와요. 다른 곳과도 나란히 놓고 비교해 보세요.' },
  { id: 'ask', n: '04', t: '맡기기', en: 'Ask', d: '궁금한 걸 먼저 풀고 편하게 상담 신청하세요. 상담만으로는 돈이 들지 않아요.' },
]
const Chars = ({ t, cls = '' }) => [...t].map((c, i) => <span key={i} className={`ch ${cls}`}>{c === ' ' ? ' ' : c}</span>)

// 첫 방문 인트로: 로고가 올라오고 빨간 줄이 차면 막이 걷히며 첫 화면이 열린다. 같은 창에서 다시 오면 생략.
function Intro({ skip, onDone }) {
  const el = useRef(null)
  const [on, setOn] = useState(() => {
    if (skip || reduce) return false
    // 느린 회선에서 이미 오래 기다린 사람에겐 인트로를 건너뛰고 바로 본문을 보여 준다.
    const cn = navigator.connection
    if (performance.now() > 2200 || cn?.saveData || /2g|3g/.test(cn?.effectiveType || '')) return false
    try { return !sessionStorage.getItem('pulsr-intro') } catch { return true }
  })
  useEffect(() => {
    if (!on) { onDone(); return }
    try { sessionStorage.setItem('pulsr-intro', '1') } catch {}
    document.documentElement.classList.add('locked')
    const n = { v: 0 }, num = el.current.querySelector('.in-num')
    const tl = gsap.timeline({ onComplete: () => setOn(false) })
    tl.from('.in-logo span', { yPercent: 110, duration: 0.55, ease: 'power4.out', stagger: 0.045 })
      .to('.in-bar i', { scaleX: 1, duration: 0.75, ease: 'power2.inOut' }, 0.05)
      .to(n, { v: 100, duration: 0.75, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(n.v)).padStart(3, '0') } }, 0.05)
      .to('.in-logo, .in-meta', { opacity: 0, y: -16, duration: 0.25, ease: 'power2.in' }, 0.85)
      .add(() => { document.documentElement.classList.remove('locked'); onDone() }, 0.95)
      .to('.in-b', { yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, 0.9)
      .to('.in-r', { yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, 1.0)
    return () => { tl.kill(); document.documentElement.classList.remove('locked') }
  }, [])
  if (!on) return null
  return (
    <div className="intro" ref={el} aria-hidden>
      <i className="in-r" />
      <div className="in-b">
        <p className="in-logo">{'PULSR'.split('').map((c, i) => <span key={i} className={c === 'R' ? 'r' : ''}>{c}</span>)}</p>
        <div className="in-meta"><span>가게 홈페이지 만드는 곳</span><span className="in-num">000</span></div>
        <div className="in-bar"><i /></div>
      </div>
    </div>
  )
}

function Reel() {
  const v = useRef(null)
  const [ch, setCh] = useState(0)
  const [src] = useState(() => (window.matchMedia('(max-width: 640px)').matches ? '/home/reel_m' : '/home/reel'))
  useEffect(() => {
    const el = v.current
    const tick = () => { const t = el.currentTime; let k = 0; CHAPTERS.forEach((c, i) => { if (t >= c.at) k = i }); setCh(k) }
    el.addEventListener('timeupdate', tick)
    // 화면 밖에 있을 땐 멈춰서 휴대폰 배터리를 아낀다.
    // 영상은 페이지가 다 뜬 뒤에 받기 시작한다(느린 망에서 제목 글자가 먼저 뜨게).
    let io
    const start = () => {
      io = new IntersectionObserver(([e]) => { if (reduce) return; e.isIntersecting ? el.play().catch(() => {}) : el.pause() })
      io.observe(el)
    }
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true })
    return () => { el.removeEventListener('timeupdate', tick); window.removeEventListener('load', start); io?.disconnect() }
  }, [])
  const c = CHAPTERS[ch]
  return (
    <div className="kh-reel">
      <video ref={v} poster={src === '/home/reel_m' ? '/home/reel_poster_m.jpg' : '/home/reel_poster.jpg'} muted loop playsInline controls={reduce} preload="none" aria-label="견본 5종을 실제로 쓰는 장면">
        <source src={`${src}.mp4`} type="video/mp4" />
        <source src={`${src}.webm`} type="video/webm" />
      </video>
      <span className="kh-tag"><span className="dot" />실제 견본을 쓰는 장면</span>
      <div className="kh-chap">
        <p><b>0{ch + 1}</b><span>/ 05</span>{c.t}</p>
        <a href={c.href}>이 견본 써 보기 <span aria-hidden>↗</span></a>
      </div>
    </div>
  )
}


// 제목 첫 줄 끝에 박힌 작은 카페 견본 영상. 페이지가 다 뜬 뒤에 받는다.
function InlineClip({ name, href, cls = '' }) {
  const v = useRef(null)
  useEffect(() => {
    if (reduce) return
    // 화면에 안 보이는 칸(휴대폰에서 숨긴 영상)은 받지 않는다.
    const go = () => v.current?.offsetParent && v.current.play().catch(() => {})
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true })
    return () => window.removeEventListener('load', go)
  }, [])
  return (
    <a className={`kh-inl ${cls}`} href={href} tabIndex={-1} data-cursor="써 보기">
      <video ref={v} muted loop playsInline preload="none" poster={`/home/${name}_s.jpg`}><source src={`/home/${name}.mp4`} type="video/mp4" /><source src={`/home/${name}.webm`} type="video/webm" /></video>
    </a>
  )
}

// 이야기 장 머리: 큰 번호와 한 단어. 내려오면 글자가 올라오고 밑줄이 그어진다.
function Chapter({ i, dark }) {
  const c = STORY[i]
  return (
    <header className={`chp ${dark ? 'dark' : ''}`} id={c.id}>
      <div className="wrap chp-in">
        <span className="chp-n" aria-hidden>{c.n}</span>
        <div className="chp-main">
          <p className="chp-en">Chapter {c.n} · {c.en}</p>
          <h2 className="chp-t" aria-label={c.t}><span aria-hidden><Chars t={c.t} /></span></h2>
        </div>
        <p className="chp-d">{c.d}</p>
      </div>
      <div className="wrap"><i className="chp-line" aria-hidden /></div>
    </header>
  )
}

// 화면 왼쪽 아래 지금 몇 번째 장인지 보여 주는 줄(PC만).
function Rail({ at }) {
  return (
    <nav className={`rail ${at < 0 ? 'off' : ''}`} aria-label="이야기 순서">
      {STORY.map((c, k) => <a key={c.id} href={`#${c.id}`} className={k === at ? 'on' : k < at ? 'past' : ''}><b>{c.n}</b><span>{c.t}</span></a>)}
    </nav>
  )
}

// 견본 목록: 큰 글자 줄. PC는 줄에 마우스를 올리면 그 견본 영상이 커서를 따라 뜨고, 휴대폰은 줄마다 영상이 들어 있다.
function WorkList({ list, all, onOpen }) {
  const box = useRef(null)
  const flt = useRef(null)
  const [hov, setHov] = useState(null)
  const [desk] = useState(() => window.matchMedia('(hover: hover) and (min-width: 981px)').matches)
  const ready = all.filter((w) => w.ready)
  useEffect(() => {
    if (reduce || !desk) return
    const fx = gsap.quickTo(flt.current, 'x', { duration: 0.6, ease: 'power3.out' })
    const fy = gsap.quickTo(flt.current, 'y', { duration: 0.6, ease: 'power3.out' })
    const move = (e) => { const r = box.current.getBoundingClientRect(); fx(e.clientX - r.left); fy(e.clientY - r.top) }
    box.current.addEventListener('pointermove', move)
    return () => box.current?.removeEventListener('pointermove', move)
  }, [])
  useEffect(() => {
    // 떠 있는 영상은 보이는 것만 재생한다.
    flt.current?.querySelectorAll('video').forEach((v) => (v.dataset.id === hov ? v.play().catch(() => {}) : v.pause()))
  }, [hov])
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting && !reduce ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: 0.3 })
    box.current.querySelectorAll('.wl-m video').forEach((v) => io.observe(v))
    return () => io.disconnect()
  }, [list])
  return (
    <div className="wl-box" ref={box} onPointerLeave={() => setHov(null)}>
      <ul className={`wl ${hov ? 'hovering' : ''}`}>
        {list.map((w) => {
          const i = all.indexOf(w)
          return (
            <li key={w.id} className={`wl-row ${w.ready ? 'ready' : 'soon'} ${hov === w.id ? 'on' : ''}`} onPointerEnter={() => w.ready && setHov(w.id)}>
              <button className="wl-hit" disabled={!w.ready} onClick={() => onOpen(w)} aria-label={`${w.name} 미리보기`} data-cursor={w.ready ? '보기' : ''} />
              <span className="wl-n">0{i + 1}</span>
              <div className="wl-main">
                <h3 className="wl-name">{w.name}</h3>
                <p className="wl-biz">{w.biz}{!w.ready && <b>제작 중</b>}</p>
              </div>
              {w.ready && <div className="wl-m"><video muted loop playsInline preload="none" poster={`/home/w_${w.id}.jpg`}><source src={`/home/w_${w.id}.mp4`} type="video/mp4" /><source src={`/home/w_${w.id}.webm`} type="video/webm" /></video></div>}
              <p className="wl-feat">{w.feat}</p>
              <p className="wl-tech">{w.tech.join(' · ')}</p>
              {w.ready ? <a className="wl-go" href={w.href} target="_blank" rel="noreferrer" aria-label={`${w.name} 새 창으로 열기`}>↗</a> : <span className="wl-go" aria-hidden>·</span>}
            </li>
          )
        })}
      </ul>
      {desk && <div className={`wl-float ${hov ? 'on' : ''}`} ref={flt} aria-hidden>
        {ready.map((w) => (
          <video key={w.id} data-id={w.id} className={hov === w.id ? 'on' : ''} muted loop playsInline preload="metadata" poster={`/home/w_${w.id}.jpg`}>
            <source src={`/home/w_${w.id}.mp4`} type="video/mp4" /><source src={`/home/w_${w.id}.webm`} type="video/webm" />
          </video>
        ))}
        <span className="wl-float-tag">눌러서 미리보기</span>
      </div>}
    </div>
  )
}

// 빨간 띠 글자: 계속 흐르고, 스크롤을 빨리 내리면 빨라지고 올리면 방향이 바뀐다.
const BAND = ['예약 받고', '주문 받고', '견적 내 주고', '레벨 진단하고', '3D로 보여 주는']
function Marquee() {
  const track = useRef(null)
  useEffect(() => {
    if (reduce) return
    const tw = gsap.to(track.current, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 })
    let dir = 1
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity()
        if (self.direction !== dir) { dir = self.direction; gsap.to(tw, { timeScale: dir, duration: 0.6 }) }
        gsap.to(tw, { timeScale: dir * Math.min(5, 1 + Math.abs(v) / 900), duration: 0.25, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: dir, duration: 1.2 }) })
      },
    })
    return () => { tw.kill(); st.kill() }
  }, [])
  const row = BAND.map((t) => <span key={t}>{t}<i aria-hidden>✱</i></span>)
  return (
    <div className="band" role="img" aria-label={BAND.join(', ') + ' 홈페이지'}>
      <div className="band-track" ref={track} aria-hidden>{row}{row}</div>
    </div>
  )
}

// PC 전용 커서: 빨간 점과 고리. 누를 수 있는 곳에선 고리가 커지고, 견본 줄 위에선 "보기"가 뜬다.
function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const [label, setLabel] = useState('')
  // 마우스를 움직이기 전엔 숨긴다(안 그러면 화면 왼쪽 위 모서리에 빨간 원이 걸려 있음).
  const [mode, setMode] = useState('hide')
  useEffect(() => {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    document.documentElement.classList.add('has-cur')
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot.current, 'y', { duration: 0.08 })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3.out' }), ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3.out' })
    let first = true
    const move = (e) => {
      if (first) { first = false; gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY }) }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY)
      const t = e.target
      const lab = t.closest?.('[data-cursor]')?.dataset.cursor
      if (lab) { setMode('label'); setLabel(lab) }
      else if (t.closest?.('input, textarea, select, iframe')) { setMode('hide'); setLabel('') }
      else if (t.closest?.('a, button, label, [role=button]')) { setMode('link'); setLabel('') }
      else { setMode(''); setLabel('') }
    }
    const out = () => setMode('hide')
    window.addEventListener('pointermove', move)
    document.addEventListener('pointerleave', out)
    return () => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', out); document.documentElement.classList.remove('has-cur') }
  }, [])
  return (
    <div className={`cur ${mode}`} aria-hidden>
      <i className="cur-dot" ref={dot} />
      <i className="cur-ring" ref={ring}><b>{label}</b></i>
    </div>
  )
}

// 끌려오는 버튼: 마우스가 버튼 위에 있으면 버튼이 커서 쪽으로 살짝 따라온다(PC).
function useMagnet(root) {
  useEffect(() => {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const els = root.current.querySelectorAll('.btn, .nav-cta, .kh-chap a')
    const offs = []
    els.forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' }), my = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })
      const mv = (e) => { const r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.28); my((e.clientY - r.top - r.height / 2) * 0.4) }
      const lv = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' })
      el.addEventListener('pointermove', mv); el.addEventListener('pointerleave', lv)
      offs.push(() => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv) })
    })
    return () => offs.forEach((f) => f())
  }, [])
}

function Device({ kind, src, label, onStep }) {
  const ref = useRef(null)
  const box = useRef(null)
  const cur = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [near, setNear] = useState(false)
  useEffect(() => {
    // 실시간 견본 화면은 무거우니 그 칸 가까이 왔을 때만 불러온다(휴대폰 첫 로딩 가볍게).
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: '400px' })
    io.observe(box.current); return () => io.disconnect()
  }, [])
  useAutoScroll(ref, loaded && kind !== 'pc')
  useTour(ref, cur, loaded && kind === 'pc', onStep || (() => {}))
  useEffect(() => {
    // 실제 화면 폭(PC 1440, 휴대폰 390)을 기기 틀 폭에 맞춰 줄인다.
    const el = box.current, base = kind === 'pc' ? 1440 : 390
    const fit = () => {
      const w = el.querySelector('.device-screen').clientWidth
      const h = el.querySelector('.device-screen').clientHeight
      const sc = w / base
      el.style.setProperty(kind === 'pc' ? '--s' : '--sp', sc)
      ref.current.style.height = `${h / sc}px`
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el)
    return () => ro.disconnect()
  }, [kind])
  return (
    <div className={`device ${kind}`} ref={box}>
      <div className="device-bar"><i /><i /><i /><span>{kind === 'pc' ? 'pulsr.kr/work/cafe' : ''}</span></div>
      <div className="device-screen">
        <iframe ref={ref} src={near ? src : undefined} title={label} tabIndex={-1} onLoad={() => near && setLoaded(true)} />
        {kind === 'pc' && <span className="cursor" ref={cur} aria-hidden />}
      </div>
    </div>
  )
}

export default function App({ fromTx }) {
  const root = useRef(null)
  const stage = useRef(null)
  const [step, setStep] = useState(-1)
  const [pv, setPv] = useState(null)
  const [preset, setPreset] = useState(null)
  const { tag, setTag, TAGS, list } = useFilter(WORKS)
  const [hideCta, setHideCta] = useState(false)
  const [ready, setReady] = useState(false)
  const [at, setAt] = useState(-1)
  const [top, setTop] = useState(true)
  // 휴대폰·태블릿은 견본 영상을 제목 바로 아래(첫 화면 안)에 둔다. PC는 제목을 두 줄로 줄여 영상 창이 첫 화면에 크게 걸리고, 내리면 화면 전체로 커진다.
  const [mob] = useState(() => window.matchMedia('(max-width: 980px)').matches)
  useMagnet(root)
  useEffect(() => {
    // 견적·상담 칸이 보이는 동안엔 휴대폰 하단 고정 버튼을 숨겨 입력 버튼을 가리지 않게 한다.
    const seen = new Set()
    const io = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id))); setHideCta(seen.size > 0) })
    ;['hero-cta', 'estimate', 'contact'].forEach((id) => io.observe(document.getElementById(id)))
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    // 맨 위 80px 안에서만 메뉴 바탕을 투명하게. 움직임 줄이기 설정과 상관없이 돈다.
    // (전에는 ScrollTrigger로 해서 페이지 맨 끝에서 다시 투명해져 로고가 아래 글자와 겹쳤다.)
    const onScroll = () => setTop(window.scrollY < 80)
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    // 부드러운 스크롤(Lenis). 휴대폰 터치는 기본 스크롤 그대로 둔다.
    if (reduce) return
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } })
    window.__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t) => lenis.raf(t * 1000)
    // 제목 글꼴이 늦게 들어오면 높이가 바뀌므로 그때 스크롤 위치를 다시 잰다.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(raf); lenis.destroy(); window.__lenis = null }
  }, [])
  useEffect(() => {
    // 인트로가 걷히는 순간 큰 글자가 한 자씩 올라온다.
    if (!ready || reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.kh .ch', { yPercent: 115, rotate: 6, duration: 1.1, ease: 'expo.out', stagger: 0.028, delay: 0.05 })
      gsap.from('.k-fade', { y: 22, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, delay: 0.55 })
      gsap.from('.kh-reel', { y: 120, opacity: 0, duration: 1.4, ease: 'expo.out', delay: 0.5 })
    }, root)
    return () => ctx.revert()
  }, [ready])
  useEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 981px)', () => {
        // 영상 창이 화면 맨 위에 닿으면 고정된 채 화면 전체로 커진다.
        gsap.timeline({ scrollTrigger: { trigger: '.kh-stage', start: 'top top', end: '+=120%', scrub: 0.8, pin: true, anticipatePin: 1 } })
          .fromTo('.kh-reel', { width: '62vw', height: '38.75vw', borderRadius: 28 }, { width: '100vw', height: '100vh', borderRadius: 0, ease: 'power2.inOut', duration: 1 })
          .fromTo('.kh-chap', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 }, 0.7)
          .to({}, { duration: 0.3 })
        // 큰 글자 세 줄이 스크롤에 따라 서로 다른 방향으로 밀려난다.
        ;[['.l1', -4], ['.l2', -4], ['.l3', 6]].forEach(([c, x]) => gsap.to(`.kh-title ${c}`, { xPercent: x, ease: 'none', scrollTrigger: { trigger: '.kh', start: 'top top', end: 'bottom top', scrub: true } }))
      })
      gsap.from('.device.pc', { y: 120, rotateY: -24, rotateX: 12, scale: 0.88, opacity: 0, duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: '.live', start: 'top 70%' } })
      gsap.from('.device.phone', { y: 200, rotate: 10, opacity: 0, duration: 1.4, ease: 'expo.out', delay: 0.25, scrollTrigger: { trigger: '.live', start: 'top 70%' } })
      gsap.utils.toArray('[data-ch]').forEach((el, k) => ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive ? setAt(k) : (k === 0 && s.direction < 0 && setAt(-1)) }))
      gsap.utils.toArray('.chp').forEach((el) => {
        gsap.from(el.querySelectorAll('.chp-t .ch'), { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 78%' } })
        gsap.from(el.querySelector('.chp-n'), { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 78%' } })
        gsap.fromTo(el.querySelector('.chp-line'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 40%', scrub: true } })
      })
      gsap.utils.toArray('.rv').forEach((el) => gsap.from(el, { y: 36, opacity: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } }))
      gsap.from('.wl-row', { y: 50, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '.wl', start: 'top 85%' } })
    }, root)
    // 마우스를 따라 빨간 빛이 움직이고, 아래 실시간 견본 화면은 살짝 기운다(PC만).
    const el = stage.current
    const tiltX = gsap.quickTo(el, 'rotateY', { duration: 0.8, ease: 'power3.out' })
    const tiltY = gsap.quickTo(el, 'rotateX', { duration: 0.8, ease: 'power3.out' })
    const gx = gsap.quickTo('.kh .glow', 'x', { duration: 1.1, ease: 'power3.out' })
    const gy = gsap.quickTo('.kh .glow', 'y', { duration: 1.1, ease: 'power3.out' })
    const move = (e) => {
      if (window.innerWidth < 981) return
      gx(e.clientX); gy(e.clientY + window.scrollY)
      const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5
      tiltX(nx * 10); tiltY(-ny * 8)
    }
    window.addEventListener('pointermove', move)
    return () => { ctx.revert(); window.removeEventListener('pointermove', move) }
  }, [])

  return (
    <div ref={root}>
      <header className={`nav ${top ? 'top' : ''}`}>
        <a className="logo" href="/">PULS<b>R</b></a>
        <nav>{STORY.map((c) => <a key={c.id} href={`#${c.id}`}><i>{c.n}</i>{c.t}</a>)}</nav>
        <a className="nav-cta" href="#contact">무료 상담</a>
      </header>

      <Intro skip={fromTx} onDone={() => setReady(true)} />
      <Cursor />
      <section className="kh">
        <div className="glow" aria-hidden />
        <div className="kh-top">
          <p className="eyebrow k-fade"><span className="dot" />가게 홈페이지 만드는 곳</p>
          <p className="kh-meta k-fade">견본 5종 · 계약 전에 직접 눌러 보기</p>
        </div>
        <h1 className="kh-title" aria-label="구경만 하는 홈페이지 말고, 써 보는 홈페이지.">
          <span className="kl l1" aria-hidden><Chars t="구경만 하는" /><InlineClip name="w_cafe" href="/work/cafe/" cls="wide" /></span>
          <span className="kl l2" aria-hidden><Chars t="홈페이지 말고," /></span>
          <span className="kl l3" aria-hidden><Chars t="써 보는" cls="red" /><Chars t=" 홈페이지." /></span>
        </h1>
        {mob && <div className="kh-mreel"><Reel /></div>}
        <div className="kh-foot">
          <p className="lede k-fade">주문 받고, 예약 받고, 견적 내 주는 화면을 미리 써 보실 수 있어요. 마음에 드는 기능을 고르시면 사장님 가게에 맞춰 그대로 만들어 드립니다.</p>
          <div className="cta k-fade" id="hero-cta">
            <a className="btn lime" href="/work/cafe/">카페 견본 직접 써 보기 <span aria-hidden>↗</span></a>
            <a className="btn line" href="#works">견본 전체 보기</a>
          </div>
        </div>
      </section>
      {!mob && <section className="kh-stage" aria-label="견본 사용 장면 영상">
        <Reel />
      </section>}

      <div data-ch>
        <Chapter i={0} />
      <section className="works" id="works">
        <div className="wrap">
          <div className="sec-head rv">
            <p className="kicker">Works · 견본</p>
            <h2>구경만 하지 말고 <em>직접 써 보세요</em></h2>
            <p>업종마다 손님이 실제로 쓰는 기능을 하나씩 넣었어요. 견본 속 가게는 모두 가상 가게이고, 나머지 견본도 차례로 열립니다.</p>
          </div>
          <div className="w-filter rv">{TAGS.map((t) => <button key={t} className={tag === t ? 'on' : ''} onClick={() => setTag(t)}>{t}</button>)}</div>
          <WorkList list={list} all={WORKS} onOpen={setPv} />
        </div>
      </section>

      </div>

      <Marquee />

      <div data-ch>
        <Chapter i={1} dark />
      <section className="live">
        <div className="live-copy">
          <p className="kicker">Live · 지금 돌아가는 화면</p>
          <h2 className="rv">이건 녹화가 아니라<br /><em>진짜 견본</em>이에요</h2>
          <p className="rv">화면 속 카페 견본에서 지금 실제로 메뉴를 담고 주문을 넣고 있어요. 홈페이지를 맡기시면 손님이 이렇게 씁니다.</p>
          <ol className="stage-steps rv">{TOUR_STEPS.map((t, i) => <li key={t} className={i === step ? 'on' : i < step ? 'past' : ''}><b>{i + 1}</b>{t}</li>)}</ol>
        </div>
        <div className="hero-stage" ref={stage} aria-label="카페 견본이 PC와 휴대폰에서 실제로 움직이는 화면">
          <Device kind="pc" src="/work/cafe/?tour" label="카페 견본 PC 화면" onStep={setStep} />
          <Device kind="phone" src="/work/cafe/?tour" label="카페 견본 휴대폰 화면" />
        </div>
      </section>

      <Levels works={WORKS} onPreview={setPv} />
      </div>

      <div data-ch>
        <Chapter i={2} />
      <Estimate onSend={(p) => { setPreset(p); const el = document.getElementById('contact'); window.__lenis ? window.__lenis.scrollTo(el, { offset: -72 }) : el.scrollIntoView({ behavior: 'smooth' }) }} />
      <Compare />
      </div>

      <section className="proof">
        <div className="wrap proof-in">
          {[['실제로 작동', '예약, 주문, 견적 기능을 계약 전에 직접 써 보세요'], ['PC·휴대폰', '손님 대부분은 휴대폰으로 들어와요. 두 화면 다 확인하세요'], ['코드 원본 전달', '코드를 통째로 드려요. 저희가 없어져도 홈페이지는 그대로예요']].map(([t, d]) => (
            <div key={t} className="rv"><b>{t}</b><span>{d}</span></div>
          ))}
        </div>
      </section>


      <div data-ch>
        <Chapter i={3} />
      <Faq />
      <Contact preset={preset} />
      </div>

      <Rail at={at} />

      <footer className="foot">
        <div className="wrap foot-in">
          <div>
            <a className="logo" href="/">PULS<b>R</b></a>
            <p>문의 <a href="mailto:hello@pulsr.kr">hello@pulsr.kr</a></p>
          </div>
          <p className="biz">상호 참좋은날(브랜드 PULSR) · 대표 조자룡 · 사업자등록번호 716-55-00819<br />전남광주통합특별시 광산구 장신로309번길 12-28, 103호(신창동) · 통신판매업 신고 면제(간이과세자)<br /><a href="/terms.html">이용약관</a> · <a href="/privacy.html">개인정보처리방침</a></p>
        </div>
      </footer>

      <a className={`m-cta ${hideCta ? 'hide' : ''}`} href="#contact">무료 상담 신청</a>
      {pv && <Preview work={pv} onClose={() => setPv(null)} />}
    </div>
  )
}
