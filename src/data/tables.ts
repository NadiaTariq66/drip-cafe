export type OrderStatus = 'idle' | 'received' | 'brewing' | 'on_the_way' | 'served' | 'billed'
export type TableSessionStatus = 'open' | 'dining' | 'closing' | 'closed'
export type TableRequestKind = 'waiter' | 'bill' | 'water' | 'feedback'

export interface CafeTable {
  code: string
  label: string
  zone: string
  seats: number
}

export interface TableSession {
  id: string
  table_code: string
  status: TableSessionStatus
  guest_name?: string
  current_drink: string
  current_item?: string
  order_status: OrderStatus
  order_note?: string
  updated_at: string
  created_at: string
}

export interface TableRequest {
  id: string
  table_code: string
  session_id?: string
  kind: TableRequestKind
  message?: string
  status: 'open' | 'acked' | 'done'
  created_at: string
}

export interface Pairing {
  name: string
  reason: string
}

export const CAFE_TABLES: CafeTable[] = [
  { code: 'G01', label: 'Table G01', zone: 'Window', seats: 2 },
  { code: 'G02', label: 'Table G02', zone: 'Window', seats: 2 },
  { code: 'G07', label: 'Table G07', zone: 'Long Table', seats: 4 },
  { code: 'G12', label: 'Table G12', zone: 'Courtyard', seats: 2 },
  { code: 'W03', label: 'Walnut 03', zone: 'Walnut Room', seats: 4 },
  { code: 'B01', label: 'Bar 01', zone: 'Brew Bar', seats: 1 },
]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  idle: 'No active order',
  received: 'Order received',
  brewing: 'Brewing now',
  on_the_way: 'On the way to your table',
  served: 'Served — enjoy',
  billed: 'Bill requested',
}

export const PAIRINGS: Record<string, Pairing[]> = {
  'Spanish Latte': [
    { name: 'Butter Croissant', reason: 'Sweet milk meets laminated butter.' },
    { name: 'Basque Cheesecake', reason: 'Double soft — café classic pairing.' },
  ],
  Cortado: [
    { name: 'Walnut Sourdough', reason: 'Clean espresso, honest bread.' },
    { name: 'Hot Honey Croissant Sando', reason: 'Focus fuel with a bite.' },
  ],
  'Tiramisu Latte': [
    { name: 'Basque Cheesecake', reason: 'Dessert answering dessert.' },
    { name: 'Pain au Chocolat', reason: 'Cocoa through-line.' },
  ],
  'Iced Latte': [
    { name: 'Crunchy Chicken Wrap', reason: 'Cool pour, crisp lunch.' },
    { name: 'Hot Honey Croissant Sando', reason: 'Heat + chill contrast.' },
  ],
  'Hot Mocha': [
    { name: 'Butter Croissant', reason: 'Rainy-day comfort stack.' },
    { name: 'Basque Cheesecake', reason: 'Chocolate finds company.' },
  ],
  default: [
    { name: 'Butter Croissant', reason: 'The house never regrets this.' },
    { name: 'Spanish Latte', reason: 'When in Gulberg, follow the favourite.' },
  ],
}

export function pairingsFor(drink: string): Pairing[] {
  const key = Object.keys(PAIRINGS).find((k) => k !== 'default' && drink.toLowerCase().includes(k.toLowerCase()))
  return PAIRINGS[key || 'default']
}

export function tableUrl(code: string, origin?: string) {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://drip.cafe')
  return `${base}/table/${code.toUpperCase()}`
}

export function qrImageUrl(data: string, size = 240) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=0d0b09&color=d9b382&margin=12`
}
