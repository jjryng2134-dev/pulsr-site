import { useEffect, useMemo, useRef, useState } from 'react'
import { TENTATIVE, BASES, FEATURES, PHOTO, CARE, LEVELS, COMPARE, FAQ } from './data.js'

const won = (man) => `${man}만원`

// 견본 미리보기: PC·휴대폰 화면을 바꿔 가며 실제 견본을 띄운다.
export function Preview({ work, onClose }) {
  const [mode, setMode] = useState('pc')
  const box = useRef(null)
  const [fit, setFit] = useState({ k: 1, h: 800 })
  useEffect(() => {
    // PC 화면은 1280px 너비로 띄우고 창 크기에 맞춰 줄인다(휴대폰에서도 PC 모습 그대로).
    const ro = new ResizeObserver(([e]) => { const { width, height } = e.contentRect; const k = Math.min(1, width / 1280); setFit({ k, h: height / k }) })
    ro.observe(box.current); return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc); document.body.style.overflow = 'hidden'; window.__lenis?.stop()
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; window.__lenis?.start() }
  }, [])
  return (
    <div className="pv-over" onClick={onClose} data-lenis-prevent>
      <div className="pv" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`${work.name} 미리보기`}>
        <div className="pv-bar">
          <div><b>{work.name}</b><span>{work.biz}</span></div>
          <div className="pv-seg">{[['pc', 'PC'], ['m', '휴대폰']].map(([k, l]) => <button key={k} className={mode === k ? 'on' : ''} onClick={() => setMode(k)}>{l}</button>)}</div>
          <a className="pv-open" href={work.href} target="_blank" rel="noreferrer">새 창 ↗</a>
          <button className="pv-x" onClick={onClose} aria-label="닫기">✕</button>
        </div>
        <div className={`pv-stage ${mode}`} ref={box}>
          {mode === 'pc'
            ? <iframe key="pc" src={work.href} title={`${work.name} 견본`} style={{ width: 1280, height: fit.h, transform: `scale(${fit.k})` }} />
            : <iframe key="m" src={work.href} title={`${work.name} 견본`} />}
        </div>
      </div>
    </div>
  )
}

export function Levels({ works, onPreview }) {
  const byId = Object.fromEntries(works.map((w) => [w.id, w]))
  return (
    <section className="levels" id="levels">
      <div className="wrap">
        <div className="sec-head rv dark">
          <p className="kicker">Levels · 어디까지 되나</p>
          <h2>필요한 만큼만 <em>골라서</em></h2>
          <p>네 단계로 나눠 봤어요. 단계마다 직접 써 볼 수 있는 견본을 붙여 두었습니다.</p>
        </div>
        <div className="lv-grid">
          {LEVELS.map((l) => (
            <article key={l.n} className="lv rv">
              <span className="lv-n">{l.n}</span>
              <p className="lv-tech">{l.tech}</p>
              <h3>{l.name}</h3>
              <p className="lv-d">{l.d}</p>
              <div className="lv-works">{l.works.map((id) => byId[id]?.ready && <button key={id} onClick={() => onPreview(byId[id])}>{byId[id].name} →</button>)}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Estimate({ onSend }) {
  const [base, setBase] = useState('one')
  const [feats, setFeats] = useState(['form'])
  const [photo, setPhoto] = useState(false)
  const [care, setCare] = useState(false)
  const b = BASES.find((x) => x.id === base)
  const picked = FEATURES.filter((f) => feats.includes(f.id))
  const sum = b.price + picked.reduce((s, f) => s + f.price, 0) + (photo ? PHOTO.price : 0)
  const days = b.days + picked.reduce((s, f) => s + f.days, 0) + (photo ? PHOTO.days : 0)
  const toggle = (id) => setFeats((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  const summary = `${b.name}${picked.length ? ' + ' + picked.map((f) => f.name).join(', ') : ''}${photo ? ' + 사진 제작' : ''}${care ? ` + 월 관리(월 ${CARE.price}만원)` : ''}`
  return (
    <section className="est" id="estimate">
      <div className="wrap est-in">
        <div>
          <div className="sec-head rv">
            <p className="kicker">Estimate · 견적</p>
            <h2>눌러 보면 <em>바로</em> 나와요</h2>
            <p>만들고 싶은 걸 고르시면 대략 얼마나, 며칠 걸리는지 바로 보여 드려요.</p>
          </div>
          <p className="e-l">어떤 홈페이지인가요?</p>
          <div className="e-bases">{BASES.map((x) => <button key={x.id} className={base === x.id ? 'on' : ''} onClick={() => setBase(x.id)}><b>{x.name}</b><span>{x.sub}</span></button>)}</div>
          <p className="e-l">넣고 싶은 기능 (여러 개 골라도 돼요)</p>
          <div className="e-feats">{FEATURES.map((f) => (
            <label key={f.id} className={feats.includes(f.id) ? 'on' : ''}>
              <input type="checkbox" checked={feats.includes(f.id)} onChange={() => toggle(f.id)} />
              <i aria-hidden />
              <span><b>{f.name}</b><small>{f.sub}</small></span>
              {f.demo && <a href={f.demo} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>견본</a>}
            </label>
          ))}</div>
          <label className={`e-photo ${photo ? 'on' : ''}`}><input type="checkbox" checked={photo} onChange={() => setPhoto(!photo)} /><i aria-hidden /><span><b>사진도 만들어 주세요</b><small>쓸 사진이 없으면 실사 느낌으로 만들어 드려요</small></span></label>
          <label className={`e-photo ${care ? 'on' : ''}`}><input type="checkbox" checked={care} onChange={() => setCare(!care)} /><i aria-hidden /><span><b>다 만든 뒤 관리도 맡길게요 (선택)</b><small>유지비는 0원 그대로, {CARE.sub} 바꿔 드려요</small></span></label>
        </div>
        <aside className="e-out">
          {TENTATIVE && <p className="e-tag">임시 금액 · 가격 확정 전</p>}
          <p className="e-t">예상 제작비</p>
          <p className="e-n"><b key={sum} className="roll">{sum}</b>만원</p>
          <p className="e-d">첫 시안까지 약 <b>{days}</b>일</p>
          <ul>
            <li><span>{b.name}</span><span>{won(b.price)}</span></li>
            {picked.map((f) => <li key={f.id}><span>{f.name}</span><span>+{won(f.price)}</span></li>)}
            {photo && <li><span>사진 제작</span><span>+{won(PHOTO.price)}</span></li>}
            <li><span>월 유지비</span><span>0원</span></li>
            {care && <li><span>월 관리 (선택)</span><span>월 {CARE.price}만원</span></li>}
          </ul>
          <button className="btn lime full" onClick={() => onSend({ summary, sum, days })}>이 구성으로 상담 신청</button>
          <p className="e-note">정확한 금액은 상담 후 확정돼요. 상담 신청만으로는 돈이 들지 않아요.</p>
        </aside>
      </div>
    </section>
  )
}

const KINDS = ['새로 만들기', '지금 홈페이지 고치기', '상세페이지만']
const BIZ = ['카페·음식점', '병원·의원', '학원·교습소', '인테리어·시공', '쇼핑몰·상품', '공방·클래스', '기타']
const BUDGET = ['50만원 아래', '50만~100만원', '100만원 넘게', '아직 모르겠어요']
const WHEN = ['한 달 안에', '두세 달 안에', '천천히']

export function Contact({ preset }) {
  const [s, setS] = useState(0)
  const [v, setV] = useState({ kind: '', biz: '', budget: '', when: '', name: '', phone: '', shop: '', memo: '', agree: false })
  const [err, setErr] = useState('')
  const [done, setDone] = useState(null)
  const [copied, setCopied] = useState(false)
  const copy = (t) => {
    const ok = () => setCopied(true)
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(t).then(ok, () => fallback(t))
    else fallback(t)
    function fallback(x) { const a = document.createElement('textarea'); a.value = x; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); ok() } catch {} a.remove() }
  }
  useEffect(() => { if (preset) setV((x) => ({ ...x, memo: `견적 계산기: ${preset.summary} (임시 ${preset.sum}만원, 약 ${preset.days}일)` })) }, [preset])
  const set = (k, val) => { setV((x) => ({ ...x, [k]: val })); setErr('') }
  const fmt = (t) => { const d = t.replace(/\D/g, '').slice(0, 11); return d.length < 4 ? d : d.length < 8 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` }
  const STEPS = ['무엇을', '업종', '예산·일정', '연락처', '확인']
  const ok = [v.kind, v.biz, v.budget && v.when, v.name.trim() && v.phone.replace(/\D/g, '').length >= 10, v.agree]
  const next = () => {
    if (!ok[s]) return setErr(['무엇을 만들지 골라 주세요', '업종을 골라 주세요', '예산과 일정을 하나씩 골라 주세요', '성함과 연락처를 적어 주세요', '개인정보 수집에 동의해 주세요'][s])
    if (s < 4) return setS(s + 1)
    const body = [`만들 것: ${v.kind}`, `업종: ${v.biz}`, `예산: ${v.budget}`, `일정: ${v.when}`, `성함: ${v.name}`, `연락처: ${v.phone}`, `상호: ${v.shop || '-'}`, `메모: ${v.memo || '-'}`].join('\n')
    setDone({ body, href: `mailto:hello@pulsr.kr?subject=${encodeURIComponent(`[상담 신청] ${v.shop || v.name} · ${v.biz}`)}&body=${encodeURIComponent(body)}` })
  }
  const Chips = ({ k, list }) => <div className="c-chips">{list.map((x) => <button type="button" key={x} className={v[k] === x ? 'on' : ''} onClick={() => set(k, x)}>{x}</button>)}</div>
  return (
    <section className="contact" id="contact">
      <div className="wrap contact-in">
        <div className="sec-head rv dark">
          <p className="kicker">Contact · 상담</p>
          <h2>다섯 번만 <em>누르면</em> 끝나요</h2>
          <p>신청만으로 돈이 들지 않아요. 남겨 주신 연락처로 저희가 먼저 연락드립니다.</p>
        </div>
        <form className="c-card rv" noValidate onSubmit={(e) => { e.preventDefault(); next() }}>
          <ol className="c-steps">{STEPS.map((t, i) => <li key={t} className={i === s ? 'on' : i < s ? 'past' : ''}><button type="button" disabled={i > s} onClick={() => setS(i)}><b>{i < s ? '✓' : i + 1}</b>{t}</button></li>)}</ol>
          <div className="c-body" key={s}>
            {s === 0 && <><h3>무엇을 만들까요?</h3><Chips k="kind" list={KINDS} /></>}
            {s === 1 && <><h3>어떤 가게인가요?</h3><Chips k="biz" list={BIZ} /></>}
            {s === 2 && <><h3>예산은 어느 정도 생각하세요?</h3><Chips k="budget" list={BUDGET} /><h3 className="h2nd">언제까지 필요하세요?</h3><Chips k="when" list={WHEN} /></>}
            {s === 3 && <><h3>연락받으실 곳을 알려 주세요</h3>
              <div className="c-row"><input id="c-name" value={v.name} onChange={(e) => set('name', e.target.value)} placeholder="성함" /><input id="c-phone" inputMode="numeric" value={v.phone} onChange={(e) => set('phone', fmt(e.target.value))} placeholder="연락처" /></div>
              <input value={v.shop} onChange={(e) => set('shop', e.target.value)} placeholder="가게 이름 (선택)" />
              <textarea value={v.memo} onChange={(e) => set('memo', e.target.value)} placeholder="하고 싶은 말 (선택)" rows={3} /></>}
            {s === 4 && <><h3>이대로 보낼까요?</h3>
              <dl className="c-sum">{[['만들 것', v.kind], ['업종', v.biz], ['예산', v.budget], ['일정', v.when], ['연락처', `${v.name} · ${v.phone}`], ...(v.memo ? [['메모', v.memo]] : [])].map(([a, b]) => <div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl>
              <label className="c-agree"><input type="checkbox" checked={v.agree} onChange={(e) => set('agree', e.target.checked)} /><span>상담 연락을 위해 성함·연락처를 모으는 데 동의해요. 보관 기간은 개인정보처리방침을 따라요. <a href="/privacy.html" target="_blank" rel="noreferrer">개인정보처리방침</a></span></label></>}
          </div>
          {err && <p className="c-err">{err}</p>}
          <div className="c-nav">
            {s > 0 ? <button type="button" className="c-back" onClick={() => setS(s - 1)}>← 이전</button> : <span />}
            <button className="btn lime" type="submit">{s < 4 ? '다음' : '상담 신청 보내기'}</button>
          </div>
        </form>
      </div>
      {done && (
        <div className="pv-over center" onClick={() => setDone(null)}>
          <div className="c-done" onClick={(e) => e.stopPropagation()}>
            <span className="c-ok">✓</span>
            <h3>거의 다 됐어요</h3>
            <p>버튼을 누르면 내용이 채워진 메일이 열려요. 보내기만 누르시면 접수됩니다.</p>
            <pre>{done.body}</pre>
            <a className="btn lime full" href={done.href}>메일로 보내기</a>
            {/* 메일 앱이 없는 PC·휴대폰에서도 보낼 수 있게: 내용을 복사해 아무 메일·문자로 보내면 된다 */}
            <button type="button" className="btn line full c-copy" onClick={() => copy(`받는 곳: hello@pulsr.kr\n${done.body}`)}>{copied ? '복사했어요. hello@pulsr.kr로 보내 주세요' : '메일 앱이 안 열리면 내용 복사하기'}</button>
            <button className="c-back" onClick={() => setDone(null)}>닫기</button>
          </div>
        </div>
      )}
    </section>
  )
}

export function Compare() {
  return (
    <section className="cmp" id="compare">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="kicker">Compare · 비교</p>
          <h2>어디가 <em>다른지</em> 한눈에</h2>
          <p>당근·크몽·숨고 제작 사례와 홈페이지연구소를 직접 열어 보고 정리했어요.</p>
        </div>
        <div className="cmp-scroll rv">
          <table>
            <thead><tr><th />{COMPARE.cols.map((c, i) => <th key={c} className={i === 2 ? 'us' : ''}>{c}</th>)}</tr></thead>
            <tbody>{COMPARE.rows.map(([k, ...cells]) => <tr key={k}><th>{k}</th>{cells.map((c, i) => <td key={i} data-col={COMPARE.cols[i].split(' (')[0]} className={i === 2 ? 'us' : ''}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p className="src">2026년 10월 17일 각 업체 페이지와 사례 사이트 19곳을 열어 보고 정리했어요. 업체 이름은 공개 페이지 기준입니다.</p>
      </div>
    </section>
  )
}

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="faq" id="faq">
      <div className="wrap faq-in">
        <div className="sec-head rv">
          <p className="kicker">FAQ · 자주 묻는 것</p>
          <h2>많이들 <em>물어보세요</em></h2>
          <p>다른 제작 업체 상품 페이지에 실제로 올라온 질문을 모았어요.</p>
        </div>
        <div className="faq-list rv">
          {FAQ.map((f, i) => (
            <div key={f.q} className={`fq ${open === i ? 'on' : ''}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}><span>{f.q}</span><i aria-hidden>+</i></button>
              <div className="fa"><div><p>{f.a}</p><small>질문 출처: {f.from}</small></div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function useFilter(works) {
  const [tag, setTag] = useState('전체')
  const TAGS = ['전체', '예약', '주문', '견적·진단', '스크롤 연출', '3D']
  const list = useMemo(() => (tag === '전체' ? works : works.filter((w) => w.tags?.includes(tag))), [tag, works])
  return { tag, setTag, TAGS, list }
}
