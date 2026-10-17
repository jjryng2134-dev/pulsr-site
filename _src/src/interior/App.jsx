import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FLOORS, WALLS } from './materials.js'

gsap.registerPlugin(ScrollTrigger)
const Room3D = lazy(() => import('./Room3D.jsx'))
const IMG = (n) => `/work/interior/img/${n}.jpg`
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 견적 계산용 예시 단가(평당·만원). 실제 제작 때 사장님 단가표로 바꾼다.
const SCOPE = [
  { id: 'paper', name: '도배', per: 8 },
  { id: 'floor', name: '바닥', per: 14 },
  { id: 'kitchen', name: '주방', fixed: 650 },
  { id: 'bath', name: '욕실', fixed: 480 },
  { id: 'light', name: '조명', per: 4 },
  { id: 'door', name: '문·몰딩', per: 6 },
]
const GRADE = [{ id: 'basic', name: '기본', k: 0.85 }, { id: 'std', name: '표준', k: 1 }, { id: 'high', name: '고급', k: 1.35 }]
const WORKS = [
  { img: 'int_kitchen', t: '32평 아파트 주방', d: '오크 상부장과 밝은 석재 상판' },
  { img: 'int_bedroom', t: '24평 안방', d: '낮은 원목 침대, 간접 조명' },
  { img: 'int_bath', t: '욕실 전체 교체', d: '대형 베이지 타일, 유리 샤워 부스' },
]
const won = (n) => `${Math.round(n).toLocaleString('ko-KR')}만원`

export default function App() {
  const [floor, setFloor] = useState('oak')
  const [wall, setWall] = useState('lime')
  const [show3d, setShow3d] = useState(false)
  const [py, setPy] = useState(32)
  const [scope, setScope] = useState(['paper', 'floor', 'light'])
  const [grade, setGrade] = useState('std')
  const [sent, setSent] = useState(null)
  const roomRef = useRef(null)

  useEffect(() => {
    // 3D는 화면 근처에 왔을 때만 불러온다(첫 화면 빠르게)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow3d(true); io.disconnect() } }, { rootMargin: '400px' })
    io.observe(roomRef.current)
    if (reduce) return () => io.disconnect()
    const ctx = gsap.context(() => {
      gsap.from('.i-hero h1 .ln', { yPercent: 110, duration: 1.2, ease: 'power4.out', stagger: 0.12, delay: 0.15 })
      gsap.from('.i-hero .fade', { y: 16, opacity: 0, duration: 0.9, stagger: 0.1, delay: 0.6 })
      gsap.fromTo('.i-hero-img', { scale: 1.15 }, { scale: 1, duration: 2.4, ease: 'power2.out' })
      gsap.to('.i-hero-img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.i-hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.utils.toArray('.rv').forEach((el) => gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } }))
      gsap.utils.toArray('.w-item').forEach((el, i) => gsap.from(el, { y: 60, opacity: 0, duration: 1, delay: i * 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.works-grid', start: 'top 80%' } }))
    })
    return () => { io.disconnect(); ctx.revert() }
  }, [])

  const k = GRADE.find((g) => g.id === grade).k
  const sum = scope.reduce((a, id) => { const s = SCOPE.find((x) => x.id === id); return a + (s.fixed || s.per * py) }, 0) * k
  const lo = sum * 0.9, hi = sum * 1.1
  const days = Math.max(3, Math.round(scope.length * 3 + py / 12))
  const toggle = (id) => setScope((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <>
      <div className="i-demo">포트폴리오용 가상 견본입니다 · 회사·시공 사례·단가는 가상 설정 · 제작 <b>PULSR</b></div>
      <header className="i-top">
        <a className="i-logo" href="#top">OROT<span>오롯 인테리어</span></a>
        <nav><a href="#ba">시공 전후</a><a href="#room">재질 고르기</a><a href="#calc">견적</a><a href="#works">사례</a></nav>
        <a className="i-cta" href="#calc">견적 받아 보기</a>
      </header>

      <section className="i-hero" id="top">
        <img className="i-hero-img" src={IMG('int_hero')} alt="오크 바닥과 석회 벽으로 고친 아파트 거실" />
        <div className="i-hero-in">
          <p className="i-kick fade">Residential Renovation</p>
          <h1><span className="m"><span className="ln">살던 집 그대로,</span></span><span className="m"><span className="ln">결만 바꿔 드립니다</span></span></h1>
          <p className="i-lede fade">공사 전에 바뀔 모습을 먼저 보여 드려요. 재질을 직접 골라 보고, 평수만 넣으면 대략 얼마 드는지 바로 나옵니다.</p>
        </div>
      </section>

      <section className="i-sec" id="ba">
        <div className="i-wrap">
          <div className="i-head rv"><p className="i-kick">Before / After</p><h2>가운데 막대를 밀어 보세요</h2><p>같은 거실, 같은 자리에서 찍었습니다.</p></div>
          <BeforeAfter />
        </div>
      </section>

      <section className="i-sec dark" id="room">
        <div className="i-wrap room-in">
          <div className="room-side rv">
            <p className="i-kick">3D Preview</p>
            <h2>바닥과 벽을<br />직접 골라 보세요</h2>
            <p>마우스나 손가락으로 방을 돌려 볼 수 있어요. 고르는 즉시 방이 바뀝니다.</p>
            <p className="pick-l">바닥</p>
            <div className="swatches">{FLOORS.map((f) => <button key={f.id} className={floor === f.id ? 'on' : ''} onClick={() => setFloor(f.id)}><i style={{ background: f.base }} />{f.name}</button>)}</div>
            <p className="pick-l">벽</p>
            <div className="swatches">{WALLS.map((w) => <button key={w.id} className={wall === w.id ? 'on' : ''} onClick={() => setWall(w.id)}><i style={{ background: w.color }} />{w.name}</button>)}</div>
          </div>
          <div className="room-stage" ref={roomRef}>
            {show3d ? <Suspense fallback={<div className="room-load">3D 방 불러오는 중…</div>}><Room3D floor={floor} wall={wall} /></Suspense> : <div className="room-load">3D 방 불러오는 중…</div>}
            <span className="drag-hint">끌어서 돌려 보기</span>
          </div>
        </div>
      </section>

      <section className="i-sec" id="calc">
        <div className="i-wrap calc-in">
          <div className="rv">
            <p className="i-kick">Estimate</p>
            <h2>평수만 넣으면<br />대략 얼마인지 나와요</h2>
            <label className="py"><span>집 크기</span><b>{py}평</b>
              <input type="range" min="10" max="60" value={py} onChange={(e) => setPy(+e.target.value)} />
            </label>
            <p className="pick-l">공사 범위</p>
            <div className="scope">{SCOPE.map((s) => <button key={s.id} className={scope.includes(s.id) ? 'on' : ''} onClick={() => toggle(s.id)}>{scope.includes(s.id) ? '✓ ' : ''}{s.name}</button>)}</div>
            <p className="pick-l">마감 등급</p>
            <div className="seg">{GRADE.map((g) => <button key={g.id} className={grade === g.id ? 'on' : ''} onClick={() => setGrade(g.id)}>{g.name}</button>)}</div>
          </div>
          <div className="est rv">
            <p className="est-t">예상 공사비</p>
            <p className="est-n">{scope.length ? `${won(lo)} ~ ${won(hi)}` : '범위를 골라 주세요'}</p>
            <p className="est-d">예상 공사 기간 약 {days}일</p>
            <ul>{scope.map((id) => { const s = SCOPE.find((x) => x.id === id); return <li key={id}><span>{s.name}</span><b>{won((s.fixed || s.per * py) * k)}</b></li> })}</ul>
            <ConsultForm summary={`${py}평 · ${scope.map((id) => SCOPE.find((x) => x.id === id).name).join('·')} · ${GRADE.find((g) => g.id === grade).name} · ${won(lo)}~${won(hi)}`} onSent={setSent} />
            <p className="tiny">견본용 예시 단가로 계산합니다. 실제 제작 때 사장님 단가표를 넣으면 그대로 계산돼요.</p>
          </div>
        </div>
      </section>

      <section className="i-sec" id="works">
        <div className="i-wrap">
          <div className="i-head rv"><p className="i-kick">Works</p><h2>최근에 고친 집</h2><p>사례 이름과 내용은 견본용 예시입니다.</p></div>
          <div className="works-grid">
            {WORKS.map((w) => <figure key={w.img} className="w-item"><div><img src={IMG(w.img)} alt={w.t} loading="lazy" /></div><figcaption><b>{w.t}</b><span>{w.d}</span></figcaption></figure>)}
          </div>
          <figure className="mat rv"><img src={IMG('int_material')} alt="오크, 석회석, 린넨, 황동 손잡이 재질 샘플" loading="lazy" /><figcaption>상담 때 실물 샘플을 직접 만져 보고 고르실 수 있어요.</figcaption></figure>
        </div>
      </section>

      <footer className="i-foot"><div className="i-wrap">오롯 인테리어는 PULSR가 만든 포트폴리오용 가상 회사이며, 사진은 AI로 만든 견본 이미지입니다. <a href="/">PULSR로 돌아가기</a></div></footer>

      {sent && (
        <div className="i-overlay" onClick={() => setSent(null)}>
          <div className="i-done" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="상담 신청 완료">
            <p className="i-kick">Thank you</p>
            <h3>{sent.name}님, 상담 신청을 받았어요</h3>
            <p>{sent.summary}</p>
            <p className="tiny">견본이라 실제로 전달되지는 않습니다. 실제 제작 때는 이 내용이 사장님 휴대폰과 구글 시트로 바로 들어갑니다.</p>
            <button className="i-btn" onClick={() => setSent(null)}>확인</button>
          </div>
        </div>
      )}
    </>
  )
}

function BeforeAfter() {
  const [x, setX] = useState(50)
  const box = useRef(null)
  const drag = useRef(false)
  const move = (e) => {
    if (!drag.current) return
    const r = box.current.getBoundingClientRect()
    setX(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
  }
  useEffect(() => {
    if (reduce) return
    // 처음 보일 때 막대가 한 번 오가며 '밀 수 있다'를 알려 준다
    const o = { v: 50 }
    const tl = gsap.timeline({ scrollTrigger: { trigger: box.current, start: 'top 70%' } })
    tl.to(o, { v: 22, duration: 0.9, ease: 'power2.inOut', onUpdate: () => setX(o.v) }).to(o, { v: 70, duration: 1.1, ease: 'power2.inOut', onUpdate: () => setX(o.v) }).to(o, { v: 50, duration: 0.8, ease: 'power2.inOut', onUpdate: () => setX(o.v) })
    return () => tl.kill()
  }, [])
  return (
    <div className="ba rv" ref={box}
      onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); move(e) }}
      onPointerMove={move} onPointerUp={() => { drag.current = false }} onPointerCancel={() => { drag.current = false }}>
      <img src={IMG('int_hero')} alt="시공 후 거실" draggable="false" />
      <div className="ba-before" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}><img src={IMG('int_before')} alt="시공 전 거실" draggable="false" /></div>
      <span className="ba-tag l">시공 전</span><span className="ba-tag r">시공 후</span>
      <div className="ba-bar" style={{ left: `${x}%` }}><i>‹ ›</i></div>
      <input className="ba-range" type="range" min="0" max="100" value={x} onChange={(e) => setX(+e.target.value)} aria-label="시공 전후 비교 막대" />
    </div>
  )
}

function ConsultForm({ summary, onSent }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')
  const fmt = (v) => { const d = v.replace(/\D/g, '').slice(0, 11); return d.length < 4 ? d : d.length < 8 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` }
  return (
    <form className="cf" noValidate onSubmit={(e) => {
      e.preventDefault()
      if (!name.trim() || phone.replace(/\D/g, '').length < 10) return setErr('성함과 연락처를 적어 주세요')
      onSent({ name: name.trim(), summary })
    }}>
      <div className="cf-row">
        <input id="cf-name" value={name} onChange={(e) => { setName(e.target.value); setErr('') }} placeholder="성함" />
        <input id="cf-phone" inputMode="numeric" value={phone} onChange={(e) => { setPhone(fmt(e.target.value)); setErr('') }} placeholder="연락처" />
      </div>
      {err && <em className="err">{err}</em>}
      <button className="i-btn" type="submit">이 견적으로 상담 신청</button>
    </form>
  )
}
