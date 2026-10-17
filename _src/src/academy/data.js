// 한걸음 수학 — PULSR 포트폴리오용 가상 학원. 반·시간표·정원은 모두 가상 설정.
export const GRADES = ['중1', '중2', '중3', '고1', '고2']

// 레벨 진단 문제(중학 수준 기초 개념). area: 계산·방정식·함수·도형·응용
export const QUIZ = [
  { q: '(-3) × 4 + 5 = ?', a: ['-7', '17', '-17', '7'], c: 0, area: '계산' },
  { q: '2x + 6 = 14 일 때 x는?', a: ['3', '4', '10', '7'], c: 1, area: '방정식' },
  { q: 'y = 2x − 1 에서 x = 3 이면 y는?', a: ['6', '7', '5', '4'], c: 2, area: '함수' },
  { q: '삼각형의 두 내각이 50°, 60°일 때 나머지 한 각은?', a: ['80°', '70°', '90°', '60°'], c: 1, area: '도형' },
  { q: '20,000원짜리 옷을 15% 할인하면 얼마일까요?', a: ['17,000원', '18,500원', '15,000원', '17,500원'], c: 0, area: '응용' },
  { q: '일차함수 y = −x + 3 그래프의 y절편은?', a: ['−3', '1', '−1', '3'], c: 3, area: '함수' },
  { q: '넓이가 36cm²인 정사각형의 한 변의 길이는?', a: ['9cm', '6cm', '18cm', '4cm'], c: 1, area: '도형' },
  { q: '3, 7, 11, 15, … 다음에 올 수는?', a: ['18', '20', '19', '21'], c: 2, area: '응용' },
]

export const LEVELS = [
  { id: 'base', name: '기초 다지기', min: 0, desc: '개념을 처음부터 차근차근 짚고, 계산 실수를 줄이는 데 집중해요.' },
  { id: 'std', name: '실력 쌓기', min: 4, desc: '개념은 잡혀 있어요. 유형 문제를 넓게 풀며 속도를 붙여요.' },
  { id: 'adv', name: '심화', min: 7, desc: '기본기가 탄탄해요. 서술형과 고난도 문제로 한 단계 올라가요.' },
]

// 반 시간표: day 0=월 … 4=금
export const CLASSES = [
  { id: 'm1b', grade: '중1', level: 'base', days: [0, 2], time: '17:00–18:40', seats: 3, cap: 8 },
  { id: 'm1s', grade: '중1', level: 'std', days: [1, 3], time: '17:00–18:40', seats: 1, cap: 8 },
  { id: 'm2s', grade: '중2', level: 'std', days: [0, 2], time: '19:00–20:40', seats: 4, cap: 8 },
  { id: 'm2a', grade: '중2', level: 'adv', days: [1, 3], time: '19:00–20:40', seats: 0, cap: 6 },
  { id: 'm3b', grade: '중3', level: 'base', days: [1, 4], time: '17:00–18:40', seats: 2, cap: 8 },
  { id: 'm3a', grade: '중3', level: 'adv', days: [0, 2], time: '19:00–21:00', seats: 2, cap: 6 },
  { id: 'h1s', grade: '고1', level: 'std', days: [1, 3], time: '19:30–21:30', seats: 5, cap: 10 },
  { id: 'h1a', grade: '고1', level: 'adv', days: [0, 4], time: '19:30–21:30', seats: 1, cap: 8 },
  { id: 'h2s', grade: '고2', level: 'std', days: [2, 4], time: '19:30–22:00', seats: 3, cap: 10 },
]
export const DAYS = ['월', '화', '수', '목', '금']
