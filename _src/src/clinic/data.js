// 맑은결 피부과 — PULSR 포트폴리오용 가상 병원. 진료 과목·시간·의료진은 모두 가상 설정.
export const CLINIC = {
  name: '맑은결 피부과',
  en: 'Malgeungyeol Dermatology',
  address: '서울 강남구 테헤란로 00, 7층',
  note: '가상 설정 주소',
  phone: '02-000-0000',
}

// 요일별 진료 시간(분). null = 휴진. late = 야간 진료일
export const HOURS = [
  null,                                   // 일
  { open: 600, close: 1140 },             // 월 10:00-19:00
  { open: 600, close: 1260, late: true }, // 화 야간 21:00
  { open: 600, close: 1140 },
  { open: 600, close: 1260, late: true }, // 목 야간
  { open: 600, close: 1140 },
  { open: 570, close: 840 },              // 토 09:30-14:00
]
export const LUNCH = [780, 840] // 13:00-14:00 (토요일은 점심 없음)

export const CATS = [
  { id: 'all', label: '전체' },
  { id: 'skin', label: '피부 질환' },
  { id: 'acne', label: '여드름·흉터' },
  { id: 'laser', label: '색소·레이저' },
  { id: 'care', label: '관리' },
]

export const CARE = [
  { id: 'eczema', cat: 'skin', name: '아토피·습진', time: 20, desc: '증상 정도를 먼저 보고 생활 습관까지 함께 상담합니다.', img: 'clinic_consult' },
  { id: 'derm', cat: 'skin', name: '일반 피부 질환', time: 15, desc: '두드러기, 사마귀, 무좀처럼 흔한 피부 질환을 봅니다.', img: 'clinic_room' },
  { id: 'acne', cat: 'acne', name: '여드름 진료', time: 30, desc: '피부 상태를 확인한 뒤 약 처방과 관리 중 맞는 쪽을 권해 드립니다.', img: 'clinic_skin' },
  { id: 'scar', cat: 'acne', name: '여드름 흉터', time: 40, desc: '흉터 모양과 깊이를 보고 몇 번 오셔야 하는지 먼저 말씀드립니다.', img: 'clinic_skin' },
  { id: 'pigment', cat: 'laser', name: '기미·잡티', time: 30, desc: '색소 종류부터 확인하고, 레이저가 맞는지 상담 후 정합니다.', img: 'clinic_room' },
  { id: 'care', cat: 'care', name: '진정·보습 관리', time: 50, desc: '예민해진 피부를 가라앉히는 관리입니다. 처음 오셔도 부담 없습니다.', img: 'clinic_lounge' },
]

export const DOCTORS = [
  { id: 'any', name: '상관없음', sub: '가장 빠른 시간' },
  { id: 'kim', name: '김원장', sub: '피부 질환·여드름' },
  { id: 'lee', name: '이원장', sub: '색소·레이저' },
]
