export type MenuCategory = 'coffee' | 'bakery' | 'kitchen' | 'signature'

export interface MenuItem {
  id: string
  name: string
  description: string
  category: MenuCategory
  price: number
  image_url: string
  tag?: string
  popular?: boolean
  sort_order?: number
}

export interface Review {
  id: string
  author: string
  role: string
  quote: string
  rating: number
}

export interface Reservation {
  id?: string
  name: string
  phone: string
  email?: string
  date: string
  time: string
  guests: number
  occasion?: string
  location?: string
  status?: string
  auto_confirmed?: boolean
}

export interface WaitlistEntry {
  id?: string
  name: string
  phone: string
  party_size: number
  status?: string
  position?: number
  eta_minutes?: number
  created_at?: string
}

export interface RitualOrder {
  id?: string
  name: string
  phone: string
  mood: string
  time_of_day: string
  drink: string
  pastry?: string
  pickup_time?: string
  notes?: string
  status?: string
}

export interface CafePulse {
  busy_level: number
  live_note: string
  avg_wait_minutes: number
}

export interface AutomationLog {
  id: string
  type: string
  title: string
  payload: Record<string, unknown>
  status: string
  created_at: string
}

export interface GalleryImage {
  id: string
  src: string
  label: string
  height: string
}
