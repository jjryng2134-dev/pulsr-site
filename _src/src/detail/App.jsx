import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PACKS, FLAVORS, SHIP, FREE_OVER, won } from './data.js'

gsap.registerPlugin(ScrollTrigger)
const IMG = (n) => `/work/detail/img/${n}.jpg`
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const GALLERY = ['gr1_hero', 'gr2_texture', 'gr3_package', 'gr5_yogurt']
const POINTS = [
  { n: '01', t: '낮은 온도로 오래 구워요', d: '센 불에 빨리 구우면 겉만 타고 속은 눅눅해지기 쉬워요. 낮은 온도에서 시간을 들여 속까지 고르게 말렸어요.', tags: ['우유에 부어도 바삭', '탄 맛 없이 고소하게'], img: 'gr2_texture' },
  { n: '02', t: '단맛은 꿀과 메이플로만', d: '설탕 시럽 대신 꿀과 메이플시럽으로 단맛을 냈어요. 얼마나 단지는 아래 상품 정보에서 직접 확인하세요.', tags: ['설탕 시럽 안 써요'], img: 'gr3_package' },
  { n: '03', t: '견과와 과일은 큼직하게', d: '아몬드, 호박씨, 크랜베리를 큼직하게 넣어서 한 숟갈마다 씹히는 게 달라요.', tags: ['아몬드', '호박씨', '크랜베리', '코코넛 칩'], img: 'gr6_snack' },
]
const WAYS = [
  { t: '우유에 부어', d: '제일 간단한 기본. 바삭하게 드시려면 붓자마자 바로 드세요.', img: 'gr4_milk' },
  { t: '요거트 위에', d: '그릭요거트에 한 줌, 과일까지 얹으면 든든한 한 끼가 돼요.', img: 'gr5_yogurt' },
  { t: '그냥 한 줌', d: '지퍼백째 들고 다니다가 출출할 때 한 줌씩 집어 드세요.', img: 'gr6_snack' },
]

export default function App() {
  const [pack, setPack] = useState('three')
  const [flavor, setFlavor] = useState('orig')
  const [qty, setQty] = useState(1)
  const [cart, setCart] = useState([])
  const [drawer, setDrawer] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [bar, setBar] = useState(false)
  const [pic, setPic] = useState(0)
  const [pt, setPt] = useState(0)
  const [toast, setToast] = useState('')
  const [ordered, setOrdered] = useState(null)
  const root = useRef(null)

  const sel = { pack, flavor, qty, setPack, setFlavor, setQty }
  const add = (buyNow) => {
    const p = PACKS.find((x) => x.id === pack), f = FLAVORS.find((x) => x.id === flavor)
    const key = pack + flavor
    setCart((c) => { const i = c.findIndex((x) => x.key === key); if (i < 0) return [...c, { key, p, f, qty }]; const n = [...c]; n[i] = { ...n[i], qty: n[i].qty + qty }; return n })
    setSheet(false)
    if (buyNow) setDrawer(true)
    else { setToast(`${p.name} · ${f.name} ${qty}개를 담았어요`); setTimeout(() => setToast(''), 2200) }
  }

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setBar(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(document.querySelector('.buy'))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.top-in > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' })
      // 1. 사진이 카드에서 화면 가득으로 열린다
      const film = gsap.timeline({ scrollTrigger: { trigger: '.film', start: 'top top', end: '+=140%', scrub: 0.6, pin: true } })
      film.fromTo('.film-img', { clipPath: 'inset(16% 24% 16% 24% round 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
        .fromTo('.film-img img', { scale: 1.3 }, { scale: 1, ease: 'none' }, 0)
        .to('.film-a', { opacity: 0, y: -40, ease: 'none', duration: 0.35 }, 0)
        .fromTo('.film-b .ln', { yPercent: 110 }, { yPercent: 0, stagger: 0.08, duration: 0.3 }, 0.55)
        .fromTo('.film-b p', { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.8)
      // 2. 공감 문장에 줄이 그어진다
      gsap.utils.toArray('.pain li').forEach((li) => gsap.fromTo(li.querySelector('s'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: li, start: 'top 75%', end: 'top 50%', scrub: true } }))
      gsap.from('.pain .turn', { opacity: 0, y: 30, scrollTrigger: { trigger: '.pain .turn', start: 'top 85%' } })
      // 3. 포인트: 왼쪽 사진이 단계마다 바뀐다
      gsap.utils.toArray('.pt-step').forEach((el, i) => ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setPt(i) }))
      // 4. 먹는 법: 가로로 흐른다
      const track = document.querySelector('.ways-track')
      gsap.to(track, { x: () => -(track.scrollWidth - window.innerWidth), ease: 'none', scrollTrigger: { trigger: '.ways', start: 'top top', end: () => '+=' + (track.scrollWidth - window.innerWidth), scrub: 0.5, pin: true, invalidateOnRefresh: true } })
      gsap.utils.toArray('.rv').forEach((el) => gsap.from(el, { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }))
    }, root)
    return () => ctx.revert()
  }, [])

  const count = cart.reduce((s, x) => s + x.qty, 0)

  return (
    <div ref={root}>
      <div className="d-demo">포트폴리오용 가상 견본 · 실제 판매 상품이 아닙니다 · 사진은 AI 견본 이미지 · 제작 <b>PULSR</b></div>
      <header className="d-top">
        <a className="d-logo" href="#">아침결<em>granola</em></a>
        <nav><a href="#story">이야기</a><a href="#points">만드는 법</a><a href="#info">상품 정보</a></nav>
        <button className="cart-btn" onClick={() => setDrawer(true)} aria-label="장바구니">장바구니<b key={count} className={count ? 'pop' : ''}>{count}</b></button>
      </header>

      {/* 쇼핑몰 상단: 사진 + 구매 */}
      <section className="top">
        <div className="top-in">
          <div className="gal">
            <div className="gal-main">{GALLERY.map((g, i) => <img key={g} src={IMG(g)} alt="" className={i === pic ? 'on' : ''} />)}</div>
            <div className="gal-th">{GALLERY.map((g, i) => <button key={g} className={i === pic ? 'on' : ''} onClick={() => setPic(i)}><img src={IMG(g)} alt={`사진 ${i + 1}`} /></button>)}</div>
          </div>
          <div className="buy">
            <p className="d-kick">아침결 수제 그래놀라</p>
            <h1>바쁜 아침,<br />한 그릇이면 충분하게</h1>
            <p className="lede">우유나 요거트에 붓기만 하면 1분 만에 아침이 돼요.</p>
            <Picker {...sel} />
            <div className="buy-btns"><button className="d-btn line" onClick={() => add(false)}>장바구니</button><button className="d-btn" onClick={() => add(true)}>바로 구매</button></div>
            <p className="tiny">가격·구성·맛은 견본용 예시입니다.</p>
          </div>
        </div>
      </section>

      {/* 스크롤 이야기 1 */}
      <section className="film" id="story">
        <div className="film-img"><img src={IMG('gr1_hero')} alt="그래놀라에 우유를 붓는 모습" /></div>
        <div className="film-a"><p className="d-kick">Morning, slowly baked</p><h2>스크롤을 내려 보세요</h2></div>
        <div className="film-b"><h2><span className="m"><span className="ln">부어서 1분,</span></span><span className="m"><span className="ln">그게 아침의 전부예요</span></span></h2><p>귀리를 낮은 온도에서 천천히 구워 바삭함이 오래가요.</p></div>
      </section>

      <section className="pain">
        <div className="d-wrap">
          <p className="d-kick">Sound familiar?</p>
          <h2>이런 아침, 익숙하시죠?</h2>
          <ul>{['아침을 거르고 오전 내내 배가 고파요', '시리얼은 금방 눅눅해져서 반은 버려요', '챙겨 먹고 싶은데 차릴 시간이 없어요'].map((t) => <li key={t}><span>{t}<s /></span></li>)}</ul>
          <p className="turn">그래서, 붓기만 하면 되는 그래놀라를 만들었어요.</p>
        </div>
      </section>

      <section className="pts" id="points">
        <div className="d-wrap pts-in">
          <div className="pts-pic">{POINTS.map((p, i) => <img key={p.n} src={IMG(p.img)} alt="" className={i === pt ? 'on' : ''} />)}<span className="pts-n">{POINTS[pt].n}<i>/03</i></span></div>
          <div>
            <div className="pts-head"><p className="d-kick">Why Achimgyeol</p><h2>세 가지를 지켜서 구워요</h2></div>
            {POINTS.map((p, i) => (
              <article key={p.n} className={`pt-step ${i === pt ? 'on' : ''}`}>
                <img className="pt-m" src={IMG(p.img)} alt="" loading="lazy" />
                <b>{p.n}</b><h3>{p.t}</h3><p>{p.d}</p>
                <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
              </article>
            ))}
            <p className="tiny">굽는 방식·단맛·원료 문구는 견본용 예시입니다. 실제 제작 때는 의뢰인이 확인해 준 내용만 씁니다.</p>
          </div>
        </div>
      </section>

      <section className="ways">
        <div className="ways-track">
          <div className="ways-intro"><p className="d-kick">How to enjoy</p><h2>1분 아침,<br />세 가지 방법</h2><p>옆으로 넘어가요 →</p></div>
          {WAYS.map((w, i) => (
            <figure key={w.t} className="way"><img src={IMG(w.img)} alt="" loading="lazy" /><figcaption><b>0{i + 1}</b><h3>{w.t}</h3><p>{w.d}</p></figcaption></figure>
          ))}
        </div>
      </section>

      <section className="info" id="info">
        <div className="d-wrap info-in">
          <div className="rv">
            <p className="d-kick">Ingredients</p><h2>무엇이 들어가나요</h2>
            <table><thead><tr><th>원재료</th><th>함량</th></tr></thead><tbody>
              {['귀리(압착)', '아몬드', '꿀', '크랜베리(건조)', '호박씨 · 코코넛 칩 · 메이플시럽 · 해바라기유 · 소금'].map((r) => <tr key={r}><td>{r}</td><td className="r">○○%</td></tr>)}
            </tbody></table>
            <p className="tiny">함량·원산지·알레르기 정보는 실제 제작 때 의뢰인의 품목제조보고 내용을 그대로 옮깁니다. 견본에서는 비워 두었어요.</p>
          </div>
          <div className="rv">
            <p className="d-kick">Product info</p><h2>꼭 확인해 주세요</h2>
            <dl>{[['제품명', '아침결 수제 그래놀라 (가상 상품)'], ['용량', '200g (1회 40g 기준 약 5회분)'], ['보관', '직사광선을 피해 실온 보관, 개봉 후 지퍼를 꼭 닫아 주세요'], ['소비기한', '제조일로부터 ○개월 (의뢰인 정보 기재)'], ['알레르기', '견과류 함유 · 의뢰인 정보 기재']].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </div>
        </div>
      </section>

      <section className="end">
        <div className="d-wrap end-in rv">
          <img src={IMG('gr3_package')} alt="지퍼백에서 쏟아진 그래놀라" loading="lazy" />
          <div><h2>내일 아침부터<br />한 그릇으로 시작하세요</h2><p>처음이라면 1봉으로 맛을 보고, 입에 맞으면 3봉이나 정기배송으로 넉넉하게.</p><button className="d-btn big" onClick={() => { setPack('one'); setSheet(true) }}>1봉부터 맛보기</button></div>
        </div>
      </section>

      <footer className="d-foot"><div className="d-wrap">이 상세페이지는 PULSR가 만든 포트폴리오용 가상 견본입니다. 상품·브랜드·가격은 실제가 아니며, 실제 제작 때는 의뢰인이 준 사진과 표시사항만 쓰고 건강·효능을 약속하는 표현은 쓰지 않습니다. <a href="/">PULSR로 돌아가기</a></div></footer>

      {/* 아래 고정 구매 바 */}
      <div className={`d-bar ${bar ? 'show' : ''}`}>
        <div><b>아침결 그래놀라</b><span>{PACKS.find((p) => p.id === pack).name} · {won(total(pack, flavor, qty))}</span></div>
        <button className="d-btn" onClick={() => setSheet(true)}>구매하기</button>
      </div>

      {sheet && (
        <div className="d-over" onClick={() => setSheet(false)}>
          <div className="d-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grab" /><h3>옵션 고르기</h3>
            <Picker {...sel} />
            <div className="buy-btns"><button className="d-btn line" onClick={() => add(false)}>장바구니</button><button className="d-btn" onClick={() => add(true)}>바로 구매</button></div>
          </div>
        </div>
      )}
      {drawer && <Drawer cart={cart} setCart={setCart} onClose={() => setDrawer(false)} onOrder={(o) => { setDrawer(false); setOrdered(o); setCart([]) }} />}
      {ordered && (
        <div className="d-over center" onClick={() => setOrdered(null)}>
          <div className="d-done" onClick={(e) => e.stopPropagation()}>
            <p className="d-kick">Order placed</p><h3>주문이 들어갔어요</h3>
            <p>{ordered.lines} · 결제 예정 {won(ordered.sum)}</p>
            <p className="tiny">견본이라 실제 결제는 되지 않아요. 실제 제작 때는 스마트스토어·카드 결제 화면으로 이어집니다.</p>
            <button className="d-btn full" onClick={() => setOrdered(null)}>확인</button>
          </div>
        </div>
      )}
      <div className={`d-toast ${toast ? 'show' : ''}`}>{toast}<button onClick={() => { setToast(''); setDrawer(true) }}>보기</button></div>
    </div>
  )
}

const total = (pack, flavor, qty) => (PACKS.find((p) => p.id === pack).price + FLAVORS.find((f) => f.id === flavor).add) * qty

function Picker({ pack, flavor, qty, setPack, setFlavor, setQty }) {
  const sum = total(pack, flavor, qty)
  const ship = sum >= FREE_OVER ? 0 : SHIP
  const left = FREE_OVER - sum
  return (
    <div className="pick">
      <p className="pl">구성</p>
      <div className="packs">{PACKS.map((p) => (
        <button key={p.id} className={pack === p.id ? 'on' : ''} onClick={() => setPack(p.id)}>
          <b>{p.name}{p.was && <em>{Math.round((1 - p.price / p.was) * 100)}% 할인</em>}</b><span>{p.sub}</span>
          <i>{p.was && <s>{won(p.was)}</s>}{won(p.price)}{p.per && `/${p.per}`}</i>
        </button>
      ))}</div>
      <p className="pl">맛</p>
      <div className="flavors">{FLAVORS.map((f) => <button key={f.id} className={flavor === f.id ? 'on' : ''} onClick={() => setFlavor(f.id)}>{f.name}{f.add > 0 && <small>+{won(f.add)}</small>}</button>)}</div>
      <div className="qty-row">
        <div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="빼기">−</button><b>{qty}</b><button onClick={() => setQty(Math.min(9, qty + 1))} aria-label="더하기">+</button></div>
        <div className="sum"><span>합계</span><b key={sum} className="tick">{won(sum)}</b></div>
      </div>
      <div className="ship"><i style={{ width: `${Math.min(100, (sum / FREE_OVER) * 100)}%` }} /><span>{ship === 0 ? '무료배송이에요' : `${won(left)} 더 담으면 무료배송 (지금 배송비 ${won(SHIP)})`}</span></div>
    </div>
  )
}

function Drawer({ cart, setCart, onClose, onOrder }) {
  const sum = cart.reduce((s, x) => s + (x.p.price + x.f.add) * x.qty, 0)
  const ship = sum === 0 || sum >= FREE_OVER ? 0 : SHIP
  const set = (key, d) => setCart((c) => c.map((x) => (x.key === key ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0))
  return (
    <div className="d-over" onClick={onClose}>
      <aside className="d-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="dr-head"><h3>장바구니</h3><button onClick={onClose}>닫기</button></div>
        {cart.length === 0 ? <p className="empty">아직 담은 게 없어요.</p> : (
          <ul className="dr-list">{cart.map((x) => (
            <li key={x.key}><img src={IMG('gr3_package')} alt="" /><div><b>{x.p.name} · {x.f.name}</b><span>{won(x.p.price + x.f.add)}{x.p.per && `/${x.p.per}`}</span>
              <div className="qty sm"><button onClick={() => set(x.key, -1)} aria-label="빼기">−</button><b>{x.qty}</b><button onClick={() => set(x.key, 1)} aria-label="더하기">+</button></div></div>
              <strong>{won((x.p.price + x.f.add) * x.qty)}</strong></li>
          ))}</ul>
        )}
        <div className="dr-sum">
          <p><span>상품 금액</span><b>{won(sum)}</b></p>
          <p><span>배송비</span><b>{ship ? won(ship) : '무료'}</b></p>
          <p className="t"><span>결제 예정</span><b>{won(sum + ship)}</b></p>
          <button className="d-btn full" disabled={!cart.length} onClick={() => onOrder({ sum: sum + ship, lines: cart.map((x) => `${x.p.name} ${x.f.name} ×${x.qty}`).join(', ') })}>주문하기</button>
        </div>
      </aside>
    </div>
  )
}
