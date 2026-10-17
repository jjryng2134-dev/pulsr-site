// 온결 커피 — PULSR 포트폴리오용 가상 가게. 가격·메뉴·주소는 견본용 예시.
export const SHOP = {
  name: '온결 커피',
  en: 'Ongyeol Coffee',
  hours: { open: 8 * 60, close: 21 * 60, lastOrder: 20 * 60 + 30 },
  closedDay: 1, // 월요일 휴무 (0=일)
  address: '서울 마포구 성미산로 00길 12, 1층',
  note: '견본용 예시 주소',
}

export const CATEGORIES = [
  { id: 'coffee', label: '커피' },
  { id: 'noncoffee', label: '논커피' },
  { id: 'bakery', label: '베이커리' },
]

export const MENU = [
  { id: 'americano', cat: 'coffee', name: '아메리카노', en: 'Americano', price: 4500, img: 'menu_americano', desc: '산미가 낮은 하우스 블렌드. 고소하고 깔끔하게 끝납니다.', temp: true, shot: true, tag: '가장 많이 찾는' },
  { id: 'latte', cat: 'coffee', name: '온결 라떼', en: 'Ongyeol Latte', price: 5300, img: 'menu_latte', desc: '우유를 60도에 맞춰 단맛을 살린 라떼.', temp: true, shot: true },
  { id: 'handdrip', cat: 'coffee', name: '오늘의 핸드드립', en: 'Hand Drip', price: 6500, img: 'menu_handdrip', desc: '매주 바뀌는 싱글 오리진을 한 잔씩 내립니다.', temp: false, hotOnly: true },
  { id: 'strawberry', cat: 'noncoffee', name: '생딸기 우유', en: 'Strawberry Milk', price: 6200, img: 'menu_strawberry', desc: '매일 아침 졸인 딸기청과 차가운 우유.', iceOnly: true, tag: '계절 한정' },
  { id: 'saltbread', cat: 'bakery', name: '소금빵', en: 'Salt Bread', price: 3500, img: 'menu_saltbread', desc: '버터를 넉넉히 넣고 굵은 소금으로 마무리.', soldOutAfter: 15 * 60, tag: '오후 3시 품절 잦음' },
  { id: 'croissant', cat: 'bakery', name: '버터 크루아상', en: 'Croissant', price: 4200, img: 'menu_croissant', desc: '72시간 숙성 반죽으로 겹을 살렸습니다.' },
  { id: 'cheesecake', cat: 'bakery', name: '바스크 치즈케이크', en: 'Basque Cheesecake', price: 6800, img: 'menu_cheesecake', desc: '겉은 진하게 태우고 속은 촉촉하게.' },
]

export const won = (n) => n.toLocaleString('ko-KR') + '원'
