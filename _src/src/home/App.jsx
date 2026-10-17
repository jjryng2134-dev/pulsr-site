import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 가격·기간은 견본 완성 뒤 경쟁 가격과 나란히 놓고 확정(계획 08 5-3). 그 전엔 임시값 표시.
const OFFER = { price: '확정 전', days: '확정 전', upkeep: '0원', tentative: true }

const WORKS = [
  { id: 'cafe', name: '온결 커피', biz: '카페·베이커리', feat: '메뉴 담기 → 픽업 시간 → 주문서', tech: ['React', 'GSAP'], href: '/work/cafe/', ready: true },
  { id: 'clinic', name: '병원 예약', biz: '피부과·치과', feat: '진료 예약 달력, 과목 필터', tech: ['React'] },
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
          w.scrollTo(0, y)
        }
      } catch {}
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])
}

function Device({ kind, src, label }) {
  const ref = useRef(null)
  const box = useRef(null)
  const [loaded, setLoaded] = useState(false)
  useAutoScroll(ref, loaded)
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
      </div>
    </div>
  )
}

export default function App() {
  const root = useRef(null)
  useEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.h-line', { yPercent: 110, duration: 1.05, ease: 'power4.out', stagger: 0.1, delay: 0.1 })
      gsap.from('.h-fade', { y: 18, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.5 })
      gsap.from('.device.pc', { y: 60, opacity: 0, rotateX: 8, duration: 1.2, ease: 'power3.out', delay: 0.35 })
      gsap.from('.device.phone', { y: 90, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.6 })
      gsap.to('.device.phone', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.utils.toArray('.rv').forEach((el) => gsap.from(el, { y: 36, opacity: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } }))
      gsap.from('.w-card', { y: 40, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: '.w-grid', start: 'top 82%' } })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <header className="nav">
        <a className="logo" href="/">PULS<b>R</b></a>
        <nav><a href="#works">견본</a><a href="#how">진행 방식</a><a href="#contact">문의</a></nav>
        <a className="nav-cta" href="#contact">무료 상담</a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow h-fade"><span className="dot" />작은 가게 홈페이지 제작</p>
          <h1>
            <span className="m"><span className="h-line">보기만 하는 견본 말고,</span></span>
            <span className="m"><span className="h-line"><em>눌러 보고</em> 고르세요</span></span>
          </h1>
          <p className="lede h-fade">주문, 예약, 견적이 실제로 돌아가는 견본을 먼저 써 보시고, 마음에 드는 기능만 골라 가게 홈페이지로 만듭니다.</p>
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
        <div className="hero-stage" aria-label="카페 견본이 PC와 휴대폰에서 실제로 움직이는 화면">
          <Device kind="pc" src="/work/cafe/" label="카페 견본 PC 화면" />
          <Device kind="phone" src="/work/cafe/" label="카페 견본 휴대폰 화면" />
          <p className="stage-cap"><span className="dot" />지금 움직이는 이 화면이 실제 견본입니다</p>
        </div>
      </section>

      <section className="proof">
        <div className="wrap proof-in">
          {[['실제로 작동', '주문·예약·견적 기능을 견본에서 바로 눌러 봅니다'], ['PC·휴대폰', '모든 견본을 두 화면에서 같이 확인합니다'], ['코드 원본 전달', '제작사가 없어져도 홈페이지는 남습니다']].map(([t, d]) => (
            <div key={t} className="rv"><b>{t}</b><span>{d}</span></div>
          ))}
        </div>
      </section>

      <section className="works" id="works">
        <div className="wrap">
          <div className="sec-head rv">
            <p className="kicker">Works · 견본</p>
            <h2>업종마다 하나씩, <em>써 볼 수 있는</em> 견본</h2>
            <p>견본 속 가게는 모두 포트폴리오용 가상 가게입니다. 나머지 다섯 개는 순서대로 만드는 중입니다.</p>
          </div>
          <div className="w-grid">
            {WORKS.map((w, i) => {
              const Tag = w.ready ? 'a' : 'div'
              return (
                <Tag key={w.id} className={`w-card ${w.ready ? 'ready' : 'soon'}`} {...(w.ready ? { href: w.href } : {})}>
                  <div className="w-thumb">
                    {w.ready ? <img src="/work/cafe/img/cafe_hero.jpg" alt="" /> : <span className="w-num">0{i + 1}</span>}
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
