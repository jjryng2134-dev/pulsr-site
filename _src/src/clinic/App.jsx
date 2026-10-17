import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CLINIC, HOURS, LUNCH, CATS, CARE, DOCTORS } from './data.js'

gsap.registerPlugin(ScrollTrigger)
const IMG = (n) => `/work/clinic/img/${n}.jpg`
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const pad = (n) => String(n).padStart(2, '0')
const hm = (m) => `${Math.floor(m / 60)}:${pad(m % 60)}`
const fmtPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length < 4) return d
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t) }, [])
  return now
}

function status(now) {
  const h = HOURS[now.getDay()], m = now.getHours() * 60 + now.getMinutes()
  if (!h) return { on: false, label: '오늘은 휴진입니다', sub: '월요일 오전 10시에 뵐게요' }
  if (m < h.open) return { on: false, label: '진료 전', sub: `오늘 ${hm(h.open)}부터 진료` }
  if (m >= h.close) return { on: false, label: '오늘 진료 마감', sub: '온라인 예약은 언제든 가능해요' }
  if (now.getDay() !== 6 && m >= LUNCH[0] && m < LUNCH[1]) return { on: false, label: '점심시간', sub: `${hm(LUNCH[1])}부터 다시 진료` }
  return { on: true, label: '지금 진료 중', sub: `오늘 ${hm(h.close)}까지${h.late ? ' · 야간 진료일' : ''}` }
}

// 날짜마다 같은 결과가 나오는 가짜 '이미 찬 자리' — 실제 제작 때는 병원 예약 시스템과 연결
function taken(date, m, doc) {
  const seed = date.getFullYear() * 400 + date.getMonth() * 31 + date.getDate() + m * 7 + (doc === 'lee' ? 3 : 0)
  return ((seed * 9301 + 49297) % 233280) / 233280 < 0.38
}

function slotsFor(date, now, doc) {
  const h = HOURS[date.getDay()]
  if (!h) return []
  const out = []
  const isToday = date.toDateString() === now.toDateString()
  const nowM = now.getHours() * 60 + now.getMinutes()
  for (let m = h.open; m < h.close; m += 30) {
    if (date.getDay() !== 6 && m >= LUNCH[0] && m < LUNCH[1]) continue
    const past = isToday && m <= nowM + 30
    const full = doc === 'any' ? taken(date, m, 'kim') && taken(date, m, 'lee') : taken(date, m, doc)
    out.push({ m, ok: !past && !full, past })
  }
  return out
}

export default function App() {
  const now = useClock()
  const st = status(now)
  const [cat, setCat] = useState('all')
  const [pick, setPick] = useState(null) // 예약 시작 시 고른 진료
  const [booked, setBooked] = useState(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.c-hero h1 .ln', { yPercent: 105, duration: 1.1, ease: 'power4.out', stagger: 0.1, delay: 0.15 })
      gsap.from('.c-hero .fade', { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, delay: 0.5 })
      gsap.from('.quick', { y: 40, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.7 })
      gsap.fromTo('.c-hero-img', { scale: 1.08 }, { scale: 1, duration: 2, ease: 'power2.out' })
      gsap.utils.toArray('.rv').forEach((el) => gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } }))
      gsap.from('.step', { y: 30, opacity: 0, stagger: 0.12, duration: 0.7, scrollTrigger: { trigger: '.steps', start: 'top 80%' } })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (reduce || !listRef.current) return
    gsap.fromTo(listRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' })
  }, [cat])

  const items = cat === 'all' ? CARE : CARE.filter((c) => c.cat === cat)
  const open = (c) => { setPick(c || CARE[0]); setBooked(null) }

  return (
    <>
      <div className="demo">포트폴리오용 가상 견본입니다 · 병원·의료진·진료 시간은 가상 설정 · 제작 <b>PULSR</b></div>
      <header className="c-top">
        <a className="c-logo" href="#top"><i />맑은결 <span>피부과</span></a>
        <nav><a href="#care">진료 안내</a><a href="#first">처음 오시는 분</a><a href="#visit">오시는 길</a></nav>
        <button className="c-btn solid" onClick={() => open()}>진료 예약</button>
      </header>

      <section className="c-hero" id="top">
        <img className="c-hero-img" src={IMG('clinic_hero')} alt="밝은 원목 접수대가 있는 피부과 대기실" />
        <div className="c-hero-in">
          <div>
            <p className={`c-live fade ${st.on ? 'on' : ''}`}><span />{st.label}<small>{st.sub}</small></p>
            <p className="c-en fade">Dermatology &amp; Skin Care</p>
            <h1><span className="m"><span className="ln">어디가 불편한지</span></span><span className="m"><span className="ln">천천히 듣고 시작합니다</span></span></h1>
            <p className="c-lede fade">처음 오셔도 괜찮아요. 오늘 비어 있는 시간을 바로 보고, 원하는 시간에 예약하실 수 있습니다.</p>
          </div>
          <QuickBook now={now} onGo={(c) => open(c)} />
        </div>
      </section>

      <section className="c-sec" id="care">
        <div className="c-wrap">
          <div className="c-head rv">
            <p className="c-en">Care</p>
            <h2>어떤 일로 오시나요?</h2>
            <p>진료를 고르면 걸리는 시간과 함께 바로 예약할 수 있어요.</p>
          </div>
          <div className="c-tabs" role="tablist">
            {CATS.map((c) => <button key={c.id} role="tab" aria-selected={cat === c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>{c.label}</button>)}
          </div>
          <div className="c-list" ref={listRef}>
            {items.map((c) => (
              <article key={c.id} className="c-card">
                <div className="c-card-img"><img src={IMG(c.img)} alt="" loading="lazy" /></div>
                <div className="c-card-body">
                  <h3>{c.name}</h3>
                  <p>{c.desc}</p>
                  <div className="c-card-foot"><span>약 {c.time}분</span><button onClick={() => open(c)}>이 진료로 예약 →</button></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="c-sec first" id="first">
        <div className="c-wrap first-in">
          <figure className="rv"><img src={IMG('clinic_lounge')} alt="햇빛이 드는 대기 공간" loading="lazy" /></figure>
          <div>
            <div className="c-head rv"><p className="c-en">First visit</p><h2>처음 오시는 날은<br />이렇게 진행돼요</h2></div>
            <ol className="steps">
              {[['접수', '신분증만 챙겨 오세요. 예약하셨다면 이름만 말씀하시면 됩니다.'], ['상담', '불편한 곳과 지금까지 써 본 약을 여쭤봅니다.'], ['진료', '피부 상태를 함께 보면서 설명드리고, 방법을 같이 정합니다.'], ['다음 예약', '다시 오셔야 하면 그 자리에서 다음 시간을 잡아 드려요.']].map(([t, d], i) => (
                <li key={t} className="step"><b>0{i + 1}</b><div><h3>{t}</h3><p>{d}</p></div></li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="c-sec" id="visit">
        <div className="c-wrap visit-in">
          <div className="rv">
            <p className="c-en">Visit</p>
            <h2>찾아오시는 길</h2>
            <p className="c-addr">{CLINIC.address}<small>{CLINIC.note}</small></p>
            <table className="c-hours"><tbody>
              {DAYS.map((d, i) => {
                const h = HOURS[i]
                return (
                  <tr key={d} className={i === now.getDay() ? 'today' : ''}>
                    <th>{d}{i === now.getDay() && <em>오늘</em>}</th>
                    <td>{h ? `${hm(h.open)} – ${hm(h.close)}` : '휴진'}{h?.late && <span className="late">야간</span>}</td>
                  </tr>
                )
              })}
            </tbody></table>
            <p className="tiny">점심시간 13:00–14:00 (토요일은 점심시간 없이 진료)</p>
          </div>
          <figure className="rv"><img src={IMG('clinic_room')} alt="깔끔한 진료실" loading="lazy" /></figure>
        </div>
      </section>

      <footer className="c-foot"><div className="c-wrap">
        맑은결 피부과는 PULSR가 만든 포트폴리오용 가상 병원이며, 사진은 AI로 만든 견본 이미지입니다. 실제 제작 때 병원 홍보 문구는 의료광고 심의 기준에 맞춰 씁니다. <a href="/">PULSR로 돌아가기</a>
      </div></footer>

      <button className="c-fab" onClick={() => open()}>진료 예약하기</button>

      {pick && !booked && <Booking now={now} first={pick} onClose={() => setPick(null)} onDone={setBooked} />}
      {booked && <Booked b={booked} onClose={() => { setBooked(null); setPick(null) }} />}
    </>
  )
}

function QuickBook({ now, onGo }) {
  // 첫 화면 위 작은 예약 카드: 진료를 고르면 오늘·내일 중 가장 빠른 빈 시간을 보여 준다
  const [id, setId] = useState('derm')
  const c = CARE.find((x) => x.id === id)
  const next = useMemo(() => {
    for (let k = 0; k < 7; k++) {
      const d = new Date(now); d.setDate(d.getDate() + k)
      const s = slotsFor(d, now, 'any').find((x) => x.ok)
      if (s) return { d, m: s.m, k }
    }
    return null
  }, [now])
  const when = next ? `${next.k === 0 ? '오늘' : next.k === 1 ? '내일' : `${next.d.getMonth() + 1}/${next.d.getDate()}(${DAYS[next.d.getDay()]})`} ${hm(next.m)}` : '—'
  return (
    <div className="quick">
      <p className="q-t">가장 빠른 예약</p>
      <label className="q-sel"><span>진료</span>
        <select value={id} onChange={(e) => setId(e.target.value)}>{CARE.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
      </label>
      <div className="q-next"><small>지금 바로 잡을 수 있는 시간</small><b>{when}</b></div>
      <button className="c-btn solid full" onClick={() => onGo(c)}>이 시간으로 예약하기</button>
    </div>
  )
}

function Booking({ now, first, onClose, onDone }) {
  const [care, setCare] = useState(first)
  const [doc, setDoc] = useState('any')
  const days = useMemo(() => Array.from({ length: 14 }, (_, k) => { const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + k); return d }), [now.toDateString()])
  const firstOpen = days.findIndex((d) => slotsFor(d, now, 'any').some((s) => s.ok))
  const [di, setDi] = useState(Math.max(0, firstOpen))
  const [slot, setSlot] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [memo, setMemo] = useState('')
  const [agree, setAgree] = useState(false)
  const [err, setErr] = useState({})
  const ref = useRef(null)
  const slots = slotsFor(days[di], now, doc)

  useEffect(() => { setSlot(null) }, [di, doc])
  const clr = (k) => err[k] && setErr((e) => ({ ...e, [k]: undefined }))
  useEffect(() => {
    if (reduce || !ref.current) return
    gsap.fromTo(ref.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' })
  }, [])

  function submit(e) {
    e.preventDefault()
    const er = {}
    if (slot == null) er.slot = '시간을 골라 주세요'
    if (!name.trim()) er.name = '성함을 적어 주세요'
    if (phone.replace(/\D/g, '').length < 10) er.phone = '연락처를 끝까지 적어 주세요'
    if (!agree) er.agree = '개인정보 수집에 동의해 주셔야 예약할 수 있어요'
    setErr(er)
    if (Object.keys(er).length) return
    const d = days[di]
    const docName = doc === 'any' ? (taken(d, slot, 'kim') ? '이원장' : '김원장') : DOCTORS.find((x) => x.id === doc).name
    onDone({ no: `MG${pad(d.getMonth() + 1)}${pad(d.getDate())}-${100 + Math.floor(Math.random() * 900)}`, care: care.name, doc: docName, when: `${d.getMonth() + 1}월 ${d.getDate()}일(${DAYS[d.getDay()]}) ${hm(slot)}`, name: name.trim(), phone })
  }

  return (
    <div className="c-overlay" onClick={onClose}>
      <form className="c-modal" ref={ref} onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate aria-label="진료 예약">
        <div className="c-modal-head"><h3>진료 예약</h3><button type="button" onClick={onClose}>닫기</button></div>

        <p className="lbl">1. 진료</p>
        <div className="chips">{CARE.map((c) => <button type="button" key={c.id} className={care.id === c.id ? 'on' : ''} onClick={() => setCare(c)}>{c.name}<small>{c.time}분</small></button>)}</div>

        <p className="lbl">2. 의료진</p>
        <div className="chips docs">{DOCTORS.map((d) => <button type="button" key={d.id} className={doc === d.id ? 'on' : ''} onClick={() => setDoc(d.id)}>{d.name}<small>{d.sub}</small></button>)}</div>

        <p className="lbl">3. 날짜와 시간</p>
        <div className="cal">
          {days.map((d, i) => {
            const closed = !HOURS[d.getDay()]
            const left = slotsFor(d, now, doc).filter((s) => s.ok).length
            return (
              <button type="button" key={i} disabled={closed || left === 0} className={`${di === i ? 'on' : ''} ${d.getDay() === 0 ? 'sun' : d.getDay() === 6 ? 'sat' : ''}`} onClick={() => setDi(i)}>
                <small>{DAYS[d.getDay()]}</small><b>{d.getDate()}</b><i>{closed ? '휴진' : left === 0 ? '마감' : `${left}자리`}</i>
              </button>
            )
          })}
        </div>
        <div className="times">
          {slots.length === 0 && <p className="tiny">휴진일입니다.</p>}
          {slots.map((s) => <button type="button" key={s.m} disabled={!s.ok} className={slot === s.m ? 'on' : ''} onClick={() => { setSlot(s.m); clr('slot') }}>{hm(s.m)}</button>)}
        </div>
        {err.slot && <em className="err">{err.slot}</em>}

        <p className="lbl">4. 예약하시는 분</p>
        <div className="two">
          <label className="fld"><span>성함</span><input id="bk-name" value={name} onChange={(e) => { setName(e.target.value); clr('name') }} placeholder="홍길동" />{err.name && <em className="err">{err.name}</em>}</label>
          <label className="fld"><span>연락처</span><input id="bk-phone" inputMode="numeric" value={phone} onChange={(e) => { setPhone(fmtPhone(e.target.value)); clr('phone') }} placeholder="010-0000-0000" />{err.phone && <em className="err">{err.phone}</em>}</label>
        </div>
        <label className="fld"><span>불편한 점 <small>(선택)</small></span><textarea rows="2" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 두 달 전부터 볼에 붉은 기가 올라와요" /></label>
        <label className="agree"><input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); clr('agree') }} /><span>예약 확인을 위해 성함과 연락처를 받는 데 동의합니다.</span></label>
        {err.agree && <em className="err">{err.agree}</em>}

        <button className="c-btn solid full big" type="submit">{slot != null ? `${days[di].getMonth() + 1}/${days[di].getDate()} ${hm(slot)} 예약하기` : '예약하기'}</button>
        <p className="tiny">견본이라 실제 예약은 들어가지 않습니다. 실제 제작 때는 병원 예약 관리 화면과 카카오 알림톡을 연결합니다.</p>
      </form>
    </div>
  )
}

function Booked({ b, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reduce || !ref.current) return
    gsap.from(ref.current.children, { y: 24, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power3.out' })
  }, [])
  return (
    <div className="c-overlay" onClick={onClose}>
      <div className="c-done" ref={ref} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="예약 완료">
        <div className="d-left">
          <p className="c-en">Reserved</p>
          <h3>{b.name}님, 예약됐어요</h3>
          <dl>
            <div><dt>예약 번호</dt><dd>{b.no}</dd></div>
            <div><dt>일시</dt><dd>{b.when}</dd></div>
            <div><dt>진료</dt><dd>{b.care}</dd></div>
            <div><dt>의료진</dt><dd>{b.doc}</dd></div>
          </dl>
          <button className="c-btn solid full" onClick={onClose}>확인</button>
        </div>
        <div className="d-phone" aria-label="손님 휴대폰으로 가는 알림 예시">
          <p className="d-cap">손님 휴대폰에는 이렇게 갑니다 (예시)</p>
          <div className="talk">
            <p className="talk-from">맑은결 피부과</p>
            <div className="bubble">
              <b>[예약 확정 안내]</b>
              <p>{b.name}님, {b.when}에 {b.care} 예약이 확정되었습니다.</p>
              <p>예약 번호 {b.no}<br />변경은 하루 전까지 아래 버튼으로 해 주세요.</p>
              <span className="talk-btn">예약 변경하기</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
