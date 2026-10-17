import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GRADES, QUIZ, LEVELS, CLASSES, DAYS } from './data.js'

gsap.registerPlugin(ScrollTrigger)
const IMG = (n) => `/work/academy/img/${n}.jpg`
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const AREAS = ['계산', '방정식', '함수', '도형', '응용']
const LIMIT = 180
const levelOf = (score) => [...LEVELS].reverse().find((l) => score >= l.min)
const lvName = (id) => LEVELS.find((l) => l.id === id).name

export default function App() {
  const [result, setResult] = useState(null)
  const [quiz, setQuiz] = useState(false)
  const [grade, setGrade] = useState('중2')
  const [apply, setApply] = useState(null)
  const [sent, setSent] = useState(null)

  useEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.a-hero h1 .ln', { yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.1, delay: 0.1 })
      gsap.from('.a-hero .fade', { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, delay: 0.45 })
      gsap.from('.a-card-hero', { x: 60, opacity: 0, rotate: 3, duration: 1.1, ease: 'expo.out', delay: 0.5 })
      gsap.from('.stat b', { textContent: 0, duration: 1.4, ease: 'power2.out', snap: { textContent: 1 }, delay: 0.8 })
      gsap.utils.toArray('.rv').forEach((el) => gsap.from(el, { y: 36, opacity: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } }))
    })
    return () => ctx.revert()
  }, [])

  const start = () => { setResult(null); setQuiz(true) }

  return (
    <>
      <div className="a-demo">포트폴리오용 가상 견본입니다 · 학원·반·시간표는 가상 설정 · 제작 <b>PULSR</b></div>
      <header className="a-top">
        <a className="a-logo" href="#top"><span>한</span>한걸음 수학</a>
        <nav><a href="#test">레벨 진단</a><a href="#classes">반 시간표</a><a href="#teach">수업 방식</a></nav>
        <button className="a-btn yellow" onClick={start}>3분 진단 시작</button>
      </header>

      <section className="a-hero" id="top">
        <div className="a-hero-in">
          <div>
            <p className="a-chip fade">중1 – 고2 수학 · 소수 정예</p>
            <h1><span className="m"><span className="ln">우리 아이 수학,</span></span><span className="m"><span className="ln"><mark>어디서부터</mark> 막혔는지</span></span><span className="m"><span className="ln">3분이면 알아요</span></span></h1>
            <p className="a-lede fade">문제 8개만 풀면 어느 단원이 약한지 바로 나오고, 맞는 반과 남은 자리까지 보여 드려요.</p>
            <div className="a-cta fade"><button className="a-btn yellow big" onClick={start}>무료 레벨 진단 시작</button><a className="a-link" href="#classes">반 시간표 먼저 보기 →</a></div>
          </div>
          <div className="a-hero-pic">
            <img src={IMG('aca_teacher')} alt="선생님이 학생 옆에서 풀이를 짚어 주는 모습" />
            <div className="a-card-hero" aria-hidden>
              <p>지난주 진단 결과 (예시)</p>
              {[['계산', 92], ['방정식', 80], ['함수', 45], ['도형', 70], ['응용', 60]].map(([k, v]) => <div key={k} className="bar"><span>{k}</span><i><em style={{ width: `${v}%` }} className={v < 50 ? 'low' : ''} /></i></div>)}
              <small>함수 단원이 약해요 → 실력 쌓기반 추천</small>
            </div>
          </div>
        </div>
        <div className="a-stats">
          {[['8', '문제'], ['3', '분'], ['5', '단원 분석']].map(([n, l]) => <div key={l} className="stat"><b>{n}</b><span>{l}</span></div>)}
        </div>
      </section>

      <section className="a-sec" id="test">
        <div className="a-wrap test-in">
          <figure className="rv"><img src={IMG('aca_study')} alt="책상에서 문제를 푸는 학생" loading="lazy" /></figure>
          <div className="rv">
            <p className="a-kick">Level Test</p>
            <h2>학년을 고르고<br />바로 시작하세요</h2>
            <p className="a-sub">회원가입 없이 풀 수 있어요. 결과를 보고 상담을 신청하면 선생님이 결과지를 들고 전화드립니다.</p>
            <div className="grades">{GRADES.map((g) => <button key={g} className={grade === g ? 'on' : ''} onClick={() => setGrade(g)}>{g}</button>)}</div>
            <button className="a-btn navy big" onClick={start}>{grade} 레벨 진단 시작</button>
            {result && <p className="last">최근 결과: {result.level.name} · {result.score}/8 <button onClick={() => setQuiz('result')}>결과 다시 보기</button></p>}
          </div>
        </div>
      </section>

      <section className="a-sec navy" id="classes">
        <div className="a-wrap">
          <div className="a-head rv"><p className="a-kick">Classes</p><h2>반 시간표와 남은 자리</h2><p>반마다 정원이 정해져 있어요. 자리가 없는 반은 대기 신청만 받아요.</p></div>
          <Timetable grade={grade} setGrade={setGrade} onApply={setApply} />
        </div>
      </section>

      <section className="a-sec" id="teach">
        <div className="a-wrap teach-in">
          <div className="rv">
            <p className="a-kick">How we teach</p>
            <h2>틀린 문제는 그날<br />다시 풀고 갑니다</h2>
            <ol className="how">
              {[['개념 설명', '새 단원은 칠판 앞에서 짧고 굵게 설명해요.'], ['바로 풀기', '설명 직후 같은 유형을 혼자 풀어 봅니다.'], ['그 자리 오답', '틀린 문제는 집에 가기 전에 선생님과 다시 풀어요.'], ['주간 리포트', '매주 금요일, 부모님께 한 장짜리 리포트를 보내요.']].map(([t, d], i) => <li key={t}><b>{i + 1}</b><div><h3>{t}</h3><p>{d}</p></div></li>)}
            </ol>
            <p className="tiny">수업 방식은 견본용 예시 문구입니다.</p>
          </div>
          <div className="teach-pics rv">
            <img src={IMG('aca_hero')} alt="밝은 강의실" loading="lazy" />
            <img src={IMG('aca_lounge')} alt="개인 자습석" loading="lazy" />
          </div>
        </div>
      </section>

      <footer className="a-foot"><div className="a-wrap">한걸음 수학은 PULSR가 만든 포트폴리오용 가상 학원이며, 사진은 AI로 만든 견본 이미지입니다. <a href="/">PULSR로 돌아가기</a></div></footer>
      <button className="a-fab" onClick={start}>3분 레벨 진단</button>

      {quiz === true && <Quiz grade={grade} onClose={() => setQuiz(false)} onDone={(r) => { setResult(r); setQuiz('result') }} />}
      {quiz === 'result' && result && <Result r={result} onClose={() => setQuiz(false)} onRetry={start} onApply={(c) => { setQuiz(false); setApply(c) }} />}
      {apply && <Apply cls={apply} result={result} onClose={() => setApply(null)} onSent={(s) => { setApply(null); setSent(s) }} />}
      {sent && (
        <div className="a-overlay" onClick={() => setSent(null)}>
          <div className="a-modal small" onClick={(e) => e.stopPropagation()}>
            <p className="a-kick">Done</p><h3>{sent.name} 학부모님, 신청 받았어요</h3>
            <p className="a-sub">{sent.text}</p>
            <p className="tiny">견본이라 실제로 전달되지는 않습니다. 실제 제작 때는 원장님 휴대폰 알림과 상담 명단으로 바로 들어갑니다.</p>
            <button className="a-btn navy full" onClick={() => setSent(null)}>확인</button>
          </div>
        </div>
      )}
    </>
  )
}

function Quiz({ grade, onClose, onDone }) {
  const [i, setI] = useState(0)
  const [ans, setAns] = useState([])
  const [left, setLeft] = useState(LIMIT)
  const card = useRef(null)
  useEffect(() => { const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000); return () => clearInterval(t) }, [])
  useEffect(() => { if (left === 0) finish(ans) }, [left])
  useEffect(() => {
    if (reduce || !card.current) return
    gsap.fromTo(card.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' })
  }, [i])

  function finish(a) {
    const score = a.filter((x, k) => x === QUIZ[k].c).length
    const by = AREAS.map((ar) => {
      const qs = QUIZ.map((q, k) => [q, k]).filter(([q]) => q.area === ar)
      return { area: ar, pct: Math.round((qs.filter(([q, k]) => a[k] === q.c).length / qs.length) * 100) }
    })
    onDone({ grade, score, level: levelOf(score), by, used: LIMIT - left })
  }
  function pick(k) {
    const a = [...ans]; a[i] = k; setAns(a)
    setTimeout(() => { if (i < QUIZ.length - 1) setI(i + 1); else finish(a) }, 260)
  }
  const q = QUIZ[i]
  return (
    <div className="a-overlay">
      <div className="a-modal quiz" role="dialog" aria-label="레벨 진단">
        <div className="q-head">
          <span>{grade} 레벨 진단</span>
          <span className={`timer ${left < 30 ? 'warn' : ''}`}>{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</span>
          <button onClick={onClose}>그만하기</button>
        </div>
        <div className="q-prog"><i style={{ width: `${(i / QUIZ.length) * 100}%` }} /></div>
        <div ref={card} key={i}>
          <p className="q-n">{i + 1} / {QUIZ.length} · {q.area}</p>
          <h3 className="q-q">{q.q}</h3>
          <div className="q-a">{q.a.map((t, k) => <button key={k} className={ans[i] === k ? 'on' : ''} onClick={() => pick(k)}><b>{'①②③④'[k]}</b>{t}</button>)}</div>
        </div>
        {i > 0 && <button className="q-back" onClick={() => setI(i - 1)}>← 이전 문제</button>}
      </div>
    </div>
  )
}

function Result({ r, onClose, onRetry, onApply }) {
  const box = useRef(null)
  const rec = CLASSES.filter((c) => c.grade === r.grade).sort((a, b) => (a.level === r.level.id ? -1 : 0) - (b.level === r.level.id ? -1 : 0))
  const weak = [...r.by].sort((a, b) => a.pct - b.pct)[0]
  useEffect(() => {
    if (reduce || !box.current) return
    gsap.from(box.current.querySelectorAll('.r-bar em'), { width: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.2 })
    gsap.from(box.current.querySelector('.r-score'), { scale: 0.6, opacity: 0, duration: 0.6, ease: 'back.out(2)' })
  }, [])
  return (
    <div className="a-overlay" onClick={onClose}>
      <div className="a-modal result" ref={box} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="진단 결과">
        <div className="r-top">
          <div className="r-score"><b>{r.score}</b><span>/ 8</span></div>
          <div><p className="a-kick">{r.grade} 진단 결과</p><h3>{r.level.name}반이 맞아요</h3><p className="a-sub">{r.level.desc}</p></div>
        </div>
        <div className="r-bars">
          {r.by.map((b) => <div key={b.area} className="r-bar"><span>{b.area}</span><i><em style={{ width: `${Math.max(4, b.pct)}%` }} className={b.pct < 50 ? 'low' : ''} /></i><b>{b.pct}%</b></div>)}
        </div>
        <p className="weak">가장 먼저 잡을 단원: <b>{weak.area}</b> · 걸린 시간 {Math.floor(r.used / 60)}분 {r.used % 60}초</p>
        <p className="lbl">{r.grade} 반 중에서 고르기</p>
        <div className="r-classes">
          {rec.map((c) => (
            <button key={c.id} className={`r-cls ${c.level === r.level.id ? 'best' : ''}`} onClick={() => onApply(c)}>
              {c.level === r.level.id && <em>추천</em>}
              <b>{c.grade} {lvName(c.level)}</b><span>{c.days.map((d) => DAYS[d]).join('·')} {c.time}</span>
              <i className={c.seats === 0 ? 'full' : ''}>{c.seats === 0 ? '대기 신청' : `${c.seats}자리 남음`}</i>
            </button>
          ))}
        </div>
        <div className="r-foot"><button className="a-link" onClick={onRetry}>다시 풀기</button><button className="a-btn navy" onClick={onClose}>닫기</button></div>
      </div>
    </div>
  )
}

function Timetable({ grade, setGrade, onApply }) {
  const list = CLASSES.filter((c) => c.grade === grade)
  return (
    <div className="tt rv">
      <div className="grades light">{GRADES.map((g) => <button key={g} className={grade === g ? 'on' : ''} onClick={() => setGrade(g)}>{g}</button>)}</div>
      <div className="tt-grid">
        <div className="tt-h" />{DAYS.map((d) => <div key={d} className="tt-h">{d}</div>)}
        {['17:00', '19:00'].map((slot) => (
          <Row key={slot} slot={slot} list={list.filter((c) => (slot === '17:00' ? c.time.startsWith('17') : !c.time.startsWith('17')))} onApply={onApply} />
        ))}
      </div>
    </div>
  )
}
function Row({ slot, list, onApply }) {
  return (
    <>
      <div className="tt-t">{slot === '17:00' ? '오후 5시' : '저녁 7시'}</div>
      {DAYS.map((_, d) => {
        const c = list.find((x) => x.days.includes(d))
        return (
          <div key={d} className="tt-c">
            {c && (
              <button className={`tt-cls lv-${c.level}`} onClick={() => onApply(c)}>
                <b>{lvName(c.level)}</b><span><em className="tt-day">{DAYS[d]}요일 </em>{c.time}</span>
                <i className={c.seats === 0 ? 'full' : ''}>{c.seats === 0 ? '마감 · 대기' : `${c.seats}/${c.cap}자리`}</i>
              </button>
            )}
          </div>
        )
      })}
    </>
  )
}

function Apply({ cls, result, onClose, onSent }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')
  const fmt = (v) => { const d = v.replace(/\D/g, '').slice(0, 11); return d.length < 4 ? d : d.length < 8 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` }
  const label = `${cls.grade} ${lvName(cls.level)} (${cls.days.map((d) => DAYS[d]).join('·')} ${cls.time})`
  return (
    <div className="a-overlay" onClick={onClose}>
      <form className="a-modal small" onClick={(e) => e.stopPropagation()} noValidate onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim() || phone.replace(/\D/g, '').length < 10) return setErr('학부모님 성함과 연락처를 적어 주세요')
        onSent({ name: name.trim(), text: `${label} ${cls.seats === 0 ? '대기 신청' : '상담 신청'}${result ? ` · 진단 ${result.score}/8, 약한 단원 ${[...result.by].sort((a, b) => a.pct - b.pct)[0].area}` : ''}` })
      }}>
        <p className="a-kick">{cls.seats === 0 ? 'Waitlist' : 'Consult'}</p>
        <h3>{cls.seats === 0 ? '대기 신청' : '상담 신청'}</h3>
        <p className="a-sub">{label}</p>
        {result && <p className="att">진단 결과({result.score}/8, {result.level.name})도 선생님께 같이 전달돼요</p>}
        <input id="ap-name" value={name} onChange={(e) => { setName(e.target.value); setErr('') }} placeholder="학부모님 성함" />
        <input id="ap-phone" inputMode="numeric" value={phone} onChange={(e) => { setPhone(fmt(e.target.value)); setErr('') }} placeholder="연락처" />
        {err && <em className="err">{err}</em>}
        <button className="a-btn yellow full" type="submit">신청하기</button>
      </form>
    </div>
  )
}
