import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SHOP, CATEGORIES, MENU, won } from './data.js'

gsap.registerPlugin(ScrollTrigger)
const IMG = (n) => `/work/cafe/img/${n}.jpg`
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const pad = (n) => String(n).padStart(2, '0')
const hm = (m) => `${m >= 720 ? '오후' : '오전'} ${((Math.floor(m / 60) + 11) % 12) + 1}:${pad(m % 60)}`

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t) }, [])
  return now
}

function shopStatus(now) {
  const m = now.getHours() * 60 + now.getMinutes()
  if (now.getDay() === SHOP.closedDay) return { open: false, label: '오늘은 쉬어요', sub: '화요일 오전 8시에 열어요' }
  if (m < SHOP.hours.open) return { open: false, label: '곧 열어요', sub: `${hm(SHOP.hours.open)} 오픈` }
  if (m >= SHOP.hours.close) return { open: false, label: '영업 종료', sub: '내일 오전 8시에 열어요' }
  return { open: true, label: '지금 영업 중', sub: `${hm(SHOP.hours.close)}까지 · 주문 마감 ${hm(SHOP.hours.lastOrder)}` }
}

function pickupSlots(now) {
  const m = now.getHours() * 60 + now.getMinutes()
  const out = []
  const today = now.getDay() !== SHOP.closedDay
  if (today) {
    let s = Math.max(m + 15, SHOP.hours.open)
    s = Math.ceil(s / 15) * 15
    for (let t = s; t <= SHOP.hours.lastOrder && out.length < 8; t += 15) out.push({ day: '오늘', m: t })
  }
  if (out.length < 4) {
    const tomorrowClosed = (now.getDay() + 1) % 7 === SHOP.closedDay
    const label = tomorrowClosed ? '모레' : '내일'
    for (let t = SHOP.hours.open + 15; out.length < 8; t += 15) out.push({ day: label, m: t })
  }
  return out
}

const fmtPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length < 4) return d
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

const TOUR = typeof location !== 'undefined' && location.search.includes('tour')
const load = () => { if (TOUR) return []; try { return JSON.parse(localStorage.getItem('ongyeol-cart') || '[]') } catch { return [] } }
const save = (c) => { if (TOUR) return; try { localStorage.setItem('ongyeol-cart', JSON.stringify(c)) } catch {} }

export default function App() {
  const now = useClock()
  const status = shopStatus(now)
  const minutes = now.getHours() * 60 + now.getMinutes()
  const [cat, setCat] = useState('coffee')
  const [sheet, setSheet] = useState(null)
  const [cart, setCart] = useState(load)
  const [drawer, setDrawer] = useState(false)
  const [done, setDone] = useState(null)
  const heroRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => save(cart), [cart])
  const count = cart.reduce((a, b) => a + b.qty, 0)
  const total = cart.reduce((a, b) => a + b.qty * b.unit, 0)

  useEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.hero-line', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.12, delay: 0.1 })
      gsap.from('.hero-meta > *', { y: 16, opacity: 0, duration: 0.8, stagger: 0.08, delay: 0.55 })
      gsap.fromTo('.hero-img', { scale: 1.12 }, { scale: 1, duration: 1.8, ease: 'power2.out' })
      gsap.to('.hero-img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } })
      })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (reduce || !gridRef.current) return
    gsap.fromTo(gridRef.current.children, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' })
  }, [cat])

  const items = MENU.filter((i) => i.cat === cat)

  function addToCart(item, opt) {
    const key = `${item.id}|${opt.temp || ''}|${opt.shot ? 1 : 0}`
    const unit = item.price + (opt.shot ? 500 : 0)
    setCart((c) => {
      const f = c.find((x) => x.key === key)
      if (f) return c.map((x) => (x.key === key ? { ...x, qty: x.qty + opt.qty } : x))
      return [...c, { key, id: item.id, name: item.name, img: item.img, temp: opt.temp, shot: opt.shot, unit, qty: opt.qty }]
    })
    setSheet(null)
  }

  return (
    <>
      <div className="demo-bar">포트폴리오용 가상 견본입니다 · 가게·가격·주소는 예시 · 제작 <b>PULSR</b></div>
      <header className="top">
        <a className="brand" href="#top"><span>온결</span><em>coffee</em></a>
        <nav><a href="#menu">메뉴</a><a href="#story">우리 커피</a><a href="#visit">오시는 길</a></nav>
        <button className="cart-btn" onClick={() => setDrawer(true)} aria-label={`장바구니 ${count}개`}>
          픽업 주문 {count > 0 && <i>{count}</i>}
        </button>
      </header>

      <section className="hero" id="top" ref={heroRef}>
        <img className="hero-img" src={IMG('cafe_hero')} alt="햇빛이 드는 카페 카운터에서 라떼를 내리는 바리스타" />
        <div className="hero-shade" />
        <div className="hero-in">
          <p className={`live ${status.open ? 'on' : ''}`}><span />{status.label}<small>{status.sub}</small></p>
          <h1><span className="mask"><span className="hero-line">오는 길에 주문하면</span></span><span className="mask"><span className="hero-line">도착할 때 딱 나와요</span></span></h1>
          <div className="hero-meta">
            <p>줄 서지 마세요. 찾으러 오실 시간만 골라 주시면 그때 맞춰 내려 둘게요.</p>
            <div className="hero-cta">
              <a className="btn light" href="#menu">메뉴 보고 주문하기</a>
              <a className="btn ghost" href="#visit">오시는 길</a>
            </div>
          </div>
        </div>
      </section>

      <section className="menu" id="menu">
        <div className="wrap">
          <div className="menu-head reveal">
            <p className="kicker">Menu · Pickup Order</p>
            <h2>오늘 고르실 한 잔</h2>
            <p className="lede">담고, 시간 고르고, 이름만 적으면 끝이에요. 견본이라 실제 주문은 들어가지 않아요.</p>
          </div>
          <div className="tabs" role="tablist">
            {CATEGORIES.map((c) => (
              <button key={c.id} role="tab" aria-selected={cat === c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>{c.label}</button>
            ))}
          </div>
          <div className="grid" ref={gridRef}>
            {items.map((it) => {
              const soldOut = it.soldOutAfter && minutes >= it.soldOutAfter
              return (
                <article key={it.id} className={`card ${soldOut ? 'out' : ''}`}>
                  <button className="card-img" onClick={() => !soldOut && setSheet(it)} disabled={soldOut} aria-label={`${it.name} 담기`}>
                    <img src={IMG(it.img)} alt={it.name} loading="lazy" />
                    {it.tag && !soldOut && <span className="tag">{it.tag}</span>}
                    {soldOut && <span className="tag dark">오늘 품절</span>}
                  </button>
                  <div className="card-body">
                    <div className="card-title"><h3>{it.name}</h3><span>{won(it.price)}</span></div>
                    <p className="en">{it.en}</p>
                    <p className="desc">{it.desc}</p>
                    <button className="add" onClick={() => setSheet(it)} disabled={soldOut}>{soldOut ? '내일 다시 구워요' : '담기 +'}</button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="story" id="story">
        <div className="wrap story-in">
          <figure className="reveal"><img src={IMG('cafe_pastry')} alt="빵이 진열된 쇼케이스" loading="lazy" /></figure>
          <div className="reveal">
            <p className="kicker">Our coffee</p>
            <h2>매일 아침 8시,<br />그날 쓸 만큼만 볶고 굽습니다</h2>
            <dl className="facts">
              <div><dt>원두</dt><dd>로스팅 후 3~10일 사이만 사용</dd></div>
              <div><dt>우유</dt><dd>60도로 데워 단맛을 살림</dd></div>
              <div><dt>빵</dt><dd>오전 8시·11시 두 번 굽기</dd></div>
            </dl>
            <p className="tiny">견본용 예시 문구입니다.</p>
          </div>
        </div>
      </section>

      <section className="visit" id="visit">
        <div className="wrap visit-in">
          <div className="reveal">
            <p className="kicker">Visit</p>
            <h2>골목 끝, 올리브 나무 있는 집</h2>
            <p className="addr">{SHOP.address}<small>{SHOP.note}</small></p>
            <table className="hours">
              <tbody>
                {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                  <tr key={d} className={i === now.getDay() ? 'today' : ''}>
                    <th>{d}{i === now.getDay() && <em>오늘</em>}</th>
                    <td>{i === SHOP.closedDay ? '정기 휴무' : '오전 8:00 – 오후 9:00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figure className="reveal map">
            <img src={IMG('cafe_exterior')} alt="카페 바깥 모습" loading="lazy" />
            <figcaption>매장 앞 벤치에서 픽업 번호를 불러 드려요</figcaption>
          </figure>
        </div>
      </section>

      <footer className="foot"><div className="wrap">온결 커피는 PULSR가 만든 포트폴리오용 가상 가게입니다. 사진은 AI로 만든 견본 이미지입니다. <a href="/">PULSR로 돌아가기</a></div></footer>

      {count > 0 && !drawer && (
        <button className="dock" onClick={() => setDrawer(true)}>
          <span>{count}개 담김</span><b>{won(total)}</b><em>주문하기</em>
        </button>
      )}

      {sheet && <OptionSheet item={sheet} onClose={() => setSheet(null)} onAdd={addToCart} />}
      {drawer && (
        <CartDrawer
          cart={cart} setCart={setCart} total={total} now={now}
          onClose={() => setDrawer(false)}
          onDone={(o) => { setDone(o); setCart([]); setDrawer(false) }}
        />
      )}
      {done && <Done order={done} onClose={() => setDone(null)} />}
    </>
  )
}

function useSheetAnim(ref, from) {
  useEffect(() => {
    if (reduce || !ref.current) return
    gsap.fromTo(ref.current, from, { x: 0, y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' })
  }, [])
}

function OptionSheet({ item, onClose, onAdd }) {
  const [temp, setTemp] = useState(item.iceOnly ? 'ICE' : item.hotOnly ? 'HOT' : item.temp ? 'ICE' : null)
  const [shot, setShot] = useState(false)
  const [qty, setQty] = useState(1)
  const ref = useRef(null)
  useSheetAnim(ref, { y: 60, opacity: 0 })
  const unit = item.price + (shot ? 500 : 0)
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" ref={ref} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`${item.name} 옵션`}>
        <img src={IMG(item.img)} alt="" />
        <div className="sheet-body">
          <h3>{item.name}</h3>
          <p className="desc">{item.desc}</p>
          {item.temp && (
            <div className="opt"><span>온도</span>
              <div className="seg">{['HOT', 'ICE'].map((t) => <button key={t} className={temp === t ? 'on' : ''} onClick={() => setTemp(t)}>{t}</button>)}</div>
            </div>
          )}
          {(item.iceOnly || item.hotOnly) && <div className="opt"><span>온도</span><em>{item.iceOnly ? 'ICE 전용' : 'HOT 전용'}</em></div>}
          {item.shot && (
            <label className="opt check"><span>샷 추가 <small>+500원</small></span><input type="checkbox" checked={shot} onChange={(e) => setShot(e.target.checked)} /></label>
          )}
          <div className="opt"><span>수량</span>
            <div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="하나 빼기">−</button><b>{qty}</b><button onClick={() => setQty(Math.min(20, qty + 1))} aria-label="하나 더">+</button></div>
          </div>
          <button className="btn dark full" onClick={() => onAdd(item, { temp, shot, qty })}>{won(unit * qty)} 담기</button>
        </div>
      </div>
    </div>
  )
}

function CartDrawer({ cart, setCart, total, now, onClose, onDone }) {
  const slots = useMemo(() => pickupSlots(now), [now])
  const [slot, setSlot] = useState(0)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [memo, setMemo] = useState('')
  const [err, setErr] = useState({})
  const ref = useRef(null)
  useSheetAnim(ref, { x: 60, opacity: 0 })

  const change = (key, d) => setCart((c) => c.map((x) => (x.key === key ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0))

  function submit(e) {
    e.preventDefault()
    const er = {}
    if (!name.trim()) er.name = '픽업할 때 부를 이름을 적어 주세요'
    if (phone.replace(/\D/g, '').length < 10) er.phone = '연락처를 끝까지 적어 주세요'
    setErr(er)
    if (Object.keys(er).length) return
    const s = slots[slot]
    onDone({ no: 100 + Math.floor(Math.random() * 900), name: name.trim(), when: `${s.day} ${hm(s.m)}`, items: cart, total })
  }

  return (
    <div className="overlay right" onClick={onClose}>
      <aside className="drawer" ref={ref} onClick={(e) => e.stopPropagation()} aria-label="픽업 주문서">
        <div className="drawer-head"><h3>픽업 주문서</h3><button onClick={onClose} aria-label="닫기">닫기</button></div>
        {cart.length === 0 ? (
          <p className="empty">아직 담은 메뉴가 없어요. 메뉴에서 <b>담기 +</b>를 눌러 보세요.</p>
        ) : (
          <form onSubmit={submit} noValidate>
            <ul className="lines">
              {cart.map((l) => (
                <li key={l.key}>
                  <img src={IMG(l.img)} alt="" />
                  <div><b>{l.name}</b><small>{[l.temp, l.shot && '샷 추가'].filter(Boolean).join(' · ') || '기본'}</small><span>{won(l.unit * l.qty)}</span></div>
                  <div className="qty sm"><button type="button" onClick={() => change(l.key, -1)} aria-label="하나 빼기">−</button><b>{l.qty}</b><button type="button" onClick={() => change(l.key, 1)} aria-label="하나 더">+</button></div>
                </li>
              ))}
            </ul>
            <fieldset>
              <legend>언제 찾으러 오세요?</legend>
              <div className="slots">
                {slots.map((s, i) => (
                  <button type="button" key={i} className={slot === i ? 'on' : ''} onClick={() => setSlot(i)}><small>{s.day}</small>{hm(s.m)}</button>
                ))}
              </div>
            </fieldset>
            <label className="field"><span>이름</span><input id="ck-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 김한결" />{err.name && <em>{err.name}</em>}</label>
            <label className="field"><span>연락처</span><input id="ck-phone" inputMode="numeric" value={phone} onChange={(e) => setPhone(fmtPhone(e.target.value))} placeholder="010-0000-0000" />{err.phone && <em>{err.phone}</em>}</label>
            <label className="field"><span>요청 사항 <small>(선택)</small></span><input id="ck-memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 얼음 적게" /></label>
            <div className="sum"><span>합계</span><b>{won(total)}</b></div>
            <button className="btn dark full" type="submit">{slots[slot].day} {hm(slots[slot].m)} 픽업으로 주문하기</button>
            <p className="tiny">견본이라 실제 주문·결제는 되지 않습니다. 실제 제작 때는 카카오페이·토스 결제와 사장님 알림을 붙입니다.</p>
          </form>
        )}
      </aside>
    </div>
  )
}

function Done({ order, onClose }) {
  const ref = useRef(null)
  useSheetAnim(ref, { y: 40, opacity: 0 })
  return (
    <div className="overlay" onClick={onClose}>
      <div className="done" ref={ref} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="주문 완료">
        <p className="kicker">주문 접수 (견본)</p>
        <p className="no">{order.no}</p>
        <h3>{order.name}님, {order.when}에 내려 둘게요</h3>
        <ul>{order.items.map((l) => <li key={l.key}>{l.name} {l.temp ? `(${l.temp})` : ''} × {l.qty}</li>)}</ul>
        <p className="sum"><span>합계</span><b>{won(order.total)}</b></p>
        <button className="btn dark full" onClick={onClose}>확인</button>
      </div>
    </div>
  )
}
