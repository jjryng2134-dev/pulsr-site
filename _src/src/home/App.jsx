import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 가격·기간은 견본 완성 뒤 경쟁 가격과 나란히 놓고 확정(계획 08 5-3). 그 전엔 임시값 표시.
const OFFER = { price: '확정 전', days: '확정 전', upkeep: '0원', tentative: true }

const WORKS = [
  { id: 'cafe', name: '온결 커피', biz: '카페·베이커리', feat: '메뉴 담기 → 픽업 시간 → 주문서', tech: ['React', 'GSAP'], href: '/work/cafe/', ready: true, thumb: '/work/cafe/img/cafe_hero.jpg' },
  { id: 'clinic', name: '맑은결 피부과', biz: '피부과·치과', feat: '남은 자리 보이는 예약 달력 → 알림톡 미리보기', tech: ['React', 'GSAP'], href: '/work/clinic/', ready: true, thumb: '/work/clinic/img/clinic_hero.jpg' },
  { id: 'interior', name: '인테리어', biz: '시공·리모델링', feat: '3D 방 돌려 보기, 전후 비교, 평수 견적', tech: ['Three.js', 'React'] },
  { id: 'academy', name: '학원 상담', biz: '학원·교습소', feat: '3분 레벨 진단 → 상담 신청', tech: ['React'] },
  { id: 'detail', name: '상품 상세', biz: '쇼핑 상세페이지', feat: '스크롤 연출, 옵션·가격 계산', tech: ['GSAP', 'React'] },
  { id: 'class', name: '원데이 클래스', biz: '공방·클래스', feat: '남은 자리 있는 날짜로 예약', tech: ['React'] },
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

function Device({ kind, src, label, onStep }) {
  const ref = useRef(null)
  const box = useRef(null)
  const cur = useRef(null)
  const [loaded, setLoaded] = useState(false)
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
        <iframe ref={ref} src={src} title={label} loading="eager" tabIndex={-1} onLoad={() => setLoaded(true)} />
        {kind === 'pc' && <span className="cursor" ref={cur} aria-hidden />}
      </div>
    </div>
  )
}

export default function App() {
  const root = useRef(null)
  const stage = useRef(null)
  const [step, setStep] = useState(-1)
  useEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.h-line', { yPercent: 110, duration: 1.05, ease: 'power4.out', stagger: 0.1, delay: 0.1 })
      gsap.from('.h-fade', { y: 18, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.5 })
      gsap.from('.hl-mark', { scaleX: 0, duration: 0.9, ease: 'power4.inOut', delay: 0.9 })
      gsap.from('.device.pc', { y: 120, rotateY: -28, rotateX: 14, scale: 0.86, opacity: 0, duration: 1.6, ease: 'expo.out', delay: 0.3 })
      gsap.from('.device.phone', { y: 220, rotate: 10, opacity: 0, duration: 1.5, ease: 'expo.out', delay: 0.65 })
      gsap.from('.glow', { scale: 0.4, opacity: 0, duration: 2.2, ease: 'power2.out' })
      gsap.to('.device.phone', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.utils.toArray('.rv').forEach((el) => gsap.from(el, { y: 36, opacity: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } }))
      gsap.from('.w-card', { y: 40, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: '.w-grid', start: 'top 82%' } })
    }, root)
    // 마우스를 따라 기기 화면이 살짝 기울고 빛이 따라온다(PC만).
    const el = stage.current
    const tiltX = gsap.quickTo(el, 'rotateY', { duration: 0.8, ease: 'power3.out' })
    const tiltY = gsap.quickTo(el, 'rotateX', { duration: 0.8, ease: 'power3.out' })
    const gx = gsap.quickTo('.glow', 'x', { duration: 1.6, ease: 'power3.out' })
    const gy = gsap.quickTo('.glow', 'y', { duration: 1.6, ease: 'power3.out' })
    const move = (e) => {
      if (window.innerWidth < 980) return
      const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5
      tiltX(nx * 10); tiltY(-ny * 8); gx(nx * 240); gy(ny * 160)
    }
    window.addEventListener('pointermove', move)
    return () => { ctx.revert(); window.removeEventListener('pointermove', move) }
  }, [])

  return (
    <div ref={root}>
      <header className="nav">
        <a className="logo" href="/">PULS<b>R</b></a>
        <nav><a href="#works">견본</a><a href="#how">진행 방식</a><a href="#contact">문의</a></nav>
        <a className="nav-cta" href="#contact">무료 상담</a>
      </header>

      <section className="hero">
        <div className="glow" aria-hidden />
        <div className="hero-copy">
          <p className="eyebrow h-fade"><span className="dot" />가게 홈페이지 만드는 곳</p>
          <h1>
            <span className="m"><span className="h-line">보기만 하는 견본 말고,</span></span>
            <span className="m"><span className="h-line"><em className="hl">직접 눌러 보고<i className="hl-mark" /></em> 고르세요</span></span>
          </h1>
          <p className="lede h-fade">주문 받고, 예약 받고, 견적 내 주는 화면을 미리 써 보실 수 있어요. 마음에 드는 기능을 고르시면 사장님 가게에 맞춰 그대로 만들어 드립니다.</p>
          <div className="cta h-fade">
            <a className="btn lime" href="/work/cafe/">카페 견본 직접 써 보기 <span aria-hidden>↗</span></a>
            <a className="btn line" href="#works">견본 6종 보기</a>
          </div>
          <dl className={`offer h-fade ${OFFER.tentative ? 'tentative' : ''}`}>
            <div><dt>제작비</dt><dd>{OFFER.price}</dd></div>
            <div><dt>첫 시안</dt><dd>{OFFER.days}</dd></div>
            <div><dt>월 유지비</dt><dd>{OFFER.upkeep}</dd></div>
            {OFFER.tentative && <p className="tent">가격·기간은 견본 6종 완성 뒤 확정해 이 자리에 공개합니다</p>}
          </dl>
        </div>
        <div className="hero-stage" ref={stage} aria-label="카페 견본이 PC와 휴대폰에서 실제로 움직이는 화면">
          <Device kind="pc" src="/work/cafe/?tour" label="카페 견본 PC 화면" onStep={setStep} />
          <Device kind="phone" src="/work/cafe/?tour" label="카페 견본 휴대폰 화면" />
          <div className="stage-cap">
            <p><span className="dot" />녹화 영상이 아니에요. 실제 견본에서 주문이 들어가는 중입니다</p>
            <ol className="stage-steps">{TOUR_STEPS.map((t, i) => <li key={t} className={i === step ? 'on' : i < step ? 'past' : ''}><b>{i + 1}</b>{t}</li>)}</ol>
          </div>
        </div>
      </section>

      <section className="proof">
        <div className="wrap proof-in">
          {[['실제로 작동', '예약, 주문, 견적 기능을 계약 전에 직접 써 보세요'], ['PC·휴대폰', '손님 대부분은 휴대폰으로 들어와요. 두 화면 다 확인하세요'], ['코드 원본 전달', '코드를 통째로 드려요. 저희가 없어져도 홈페이지는 그대로예요']].map(([t, d]) => (
            <div key={t} className="rv"><b>{t}</b><span>{d}</span></div>
          ))}
        </div>
      </section>

      <section className="works" id="works">
        <div className="wrap">
          <div className="sec-head rv">
            <p className="kicker">Works · 견본</p>
            <h2>구경만 하지 말고 <em>직접 써 보세요</em></h2>
            <p>업종마다 손님이 실제로 쓰는 기능을 하나씩 넣었어요. 견본 속 가게는 모두 가상 가게이고, 나머지 견본도 차례로 열립니다.</p>
          </div>
          <div className="w-grid">
            {WORKS.map((w, i) => {
              const Tag = w.ready ? 'a' : 'div'
              return (
                <Tag key={w.id} className={`w-card ${w.ready ? 'ready' : 'soon'}`} {...(w.ready ? { href: w.href } : {})}>
                  <div className="w-thumb">
                    {w.ready ? <img src={w.thumb} alt="" /> : <span className="w-num">0{i + 1}</span>}
                    <span className={`w-state ${w.ready ? 'on' : ''}`}>{w.ready ? '써 보기 가능' : '제작 중'}</span>
                  </div>
                  <div className="w-body">
                    <p className="w-biz">{w.biz}</p>
                    <h3>{w.name}</h3>
                    <p className="w-feat">{w.feat}</p>
                    <p className="w-tech">{w.tech.map((t) => <span key={t}>{t}</span>)}</p>
                  </div>
                </Tag>
              )
            })}
          </div>
        </div>
      </section>

      <footer className="foot" id="contact">
        <div className="wrap foot-in">
          <div>
            <a className="logo" href="/">PULS<b>R</b></a>
            <p>문의 <a href="mailto:hello@pulsr.kr">hello@pulsr.kr</a></p>
          </div>
          <p className="biz">상호 참좋은날(브랜드 PULSR) · 대표 조자룡 · 사업자등록번호 716-55-00819<br />전남광주통합특별시 광산구 장신로309번길 12-28, 103호(신창동) · 통신판매업 신고 면제(간이과세자)<br /><a href="/terms.html">이용약관</a> · <a href="/privacy.html">개인정보처리방침</a></p>
        </div>
      </footer>

      <a className="m-cta" href="#contact">무료 상담 신청</a>
    </div>
  )
}
