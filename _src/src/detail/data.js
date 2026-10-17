// 가격·구성·맛은 모두 견본용 예시. 실제 제작 때는 의뢰인 판매 조건으로 바꾼다.
export const PACKS = [
  { id: 'one', name: '1봉', sub: '200g · 처음 드셔 보는 분', price: 12900 },
  { id: 'three', name: '3봉 묶음', sub: '600g · 매일 드시는 분', price: 34900, was: 38700 },
  { id: 'sub', name: '정기배송', sub: '2주마다 2봉 · 언제든 해지', price: 22900, per: '회' },
]
export const FLAVORS = [
  { id: 'orig', name: '오리지널', add: 0 },
  { id: 'cacao', name: '카카오 닙스', add: 1000 },
  { id: 'plain', name: '단맛 적게', add: 0 },
]
export const SHIP = 3000
export const FREE_OVER = 30000
export const won = (n) => n.toLocaleString('ko-KR') + '원'
