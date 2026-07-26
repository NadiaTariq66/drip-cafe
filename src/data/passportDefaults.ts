import type { Achievement, Reward, StampRule } from '../lib/passportTypes'

export const DEFAULT_STAMP_RULES: StampRule[] = [
  {
    id: 'rule-order',
    key: 'order_completed',
    title: 'Completed Order',
    description: 'One inked stamp for every completed order or ritual pickup.',
    event_type: 'order_completed',
    stamps_awarded: 1,
    active: true,
  },
  {
    id: 'rule-visit',
    key: 'visit_verified',
    title: 'Verified Visit',
    description: 'Staff-verified presence at a DRIP house.',
    event_type: 'visit_verified',
    stamps_awarded: 1,
    active: true,
  },
  {
    id: 'rule-ritual',
    key: 'ritual_completed',
    title: 'Ritual Fulfilled',
    description: 'A queued ritual collected and enjoyed.',
    event_type: 'ritual_completed',
    stamps_awarded: 1,
    active: true,
  },
]

export const DEFAULT_REWARDS: Reward[] = [
  {
    id: 'rew-3',
    title: 'First Crossing',
    description: 'Your passport has been inked.',
    stamps_required: 3,
    perk: 'Complimentary espresso shot',
    active: true,
    sort_order: 1,
  },
  {
    id: 'rew-6',
    title: 'Bronze Corridor',
    description: 'A quiet perk for returning travellers.',
    stamps_required: 6,
    perk: 'Free pastry with any latte',
    active: true,
    sort_order: 2,
  },
  {
    id: 'rew-10',
    title: 'Gulberg Resident',
    description: 'You know the light at every hour.',
    stamps_required: 10,
    perk: 'Priority window seat once a month',
    active: true,
    sort_order: 3,
  },
  {
    id: 'rew-15',
    title: 'House Diplomat',
    description: 'Among the most travelled at DRIP.',
    stamps_required: 15,
    perk: 'Private tasting for two',
    active: true,
    sort_order: 4,
  },
]

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-spanish',
    key: 'spanish_latte_explorer',
    title: 'Spanish Latte Explorer',
    description: 'Collect three stamps from Spanish Latte rituals.',
    icon: 'espresso',
    criteria: { drink_contains: 'Spanish Latte', count: 3 },
    active: true,
  },
  {
    id: 'ach-matcha',
    key: 'matcha_lover',
    title: 'Matcha Lover',
    description: 'Earn two stamps tied to Matcha orders.',
    icon: 'leaf',
    criteria: { drink_contains: 'Matcha', count: 2 },
    active: true,
  },
  {
    id: 'ach-bakery',
    key: 'bakery_enthusiast',
    title: 'Bakery Enthusiast',
    description: 'Three bakery-linked stamps in your book.',
    icon: 'croissant',
    criteria: { category: 'bakery', count: 3 },
    active: true,
  },
  {
    id: 'ach-weekend',
    key: 'weekend_regular',
    title: 'Weekend Regular',
    description: 'Two verified weekend visits.',
    icon: 'calendar',
    criteria: { weekend_visits: 2 },
    active: true,
  },
  {
    id: 'ach-early',
    key: 'early_bird',
    title: 'Early Bird',
    description: 'One visit or order before 10:00 AM.',
    icon: 'sun',
    criteria: { before_hour: 10, count: 1 },
    active: true,
  },
]

export const STAMP_SLOTS = 12

export const INK_PALETTE = ['#8b5a2b', '#6f4e37', '#b78a52', '#4a3728', '#9c6b3c', '#5c4033']

export function makePassportNumber() {
  const chunk = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `DRIP-${chunk}`
}
