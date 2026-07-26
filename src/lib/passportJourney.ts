import type { PassportStamp } from './passportTypes'

export type JourneyStep = {
  id: string
  title: string
  value: string
  detail: string
  unlocked: boolean
}

function drinkFromStamp(s: PassportStamp) {
  return (s.meta?.drink || s.label.split('·')[0] || s.label).trim()
}

function dayKeyFromDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dayKey(iso: string) {
  return dayKeyFromDate(new Date(iso))
}

function formatLong(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function activeBand(hour: number) {
  if (hour < 11) return 'Morning light'
  if (hour < 16) return 'Afternoon calm'
  if (hour < 20) return 'Golden hour'
  return 'Late night ritual'
}

function currentStreak(stamps: PassportStamp[]) {
  if (!stamps.length) return 0
  const days = new Set(stamps.map((s) => dayKey(s.earned_at)))
  const cursor = new Date()
  cursor.setHours(12, 0, 0, 0)

  if (!days.has(dayKeyFromDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(dayKeyFromDate(cursor))) return 0
  }

  let streak = 0
  while (days.has(dayKeyFromDate(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function buildJourney(stamps: PassportStamp[]): JourneyStep[] {
  const sorted = [...stamps].sort((a, b) => a.earned_at.localeCompare(b.earned_at))
  const first = sorted[0]

  const spanish = sorted.find((s) => /spanish\s*latte/i.test(drinkFromStamp(s) + ' ' + s.label))

  const drinkCounts = new Map<string, number>()
  for (const s of sorted) {
    const drink = drinkFromStamp(s)
    if (/verified/i.test(drink)) continue
    drinkCounts.set(drink, (drinkCounts.get(drink) || 0) + 1)
  }
  let favorite = ''
  let favoriteCount = 0
  for (const [drink, n] of drinkCounts) {
    if (n > favoriteCount) {
      favorite = drink
      favoriteCount = n
    }
  }

  const bands = new Map<string, number>()
  for (const s of sorted) {
    const hour = s.meta?.hour ?? new Date(s.earned_at).getHours()
    const band = activeBand(hour)
    bands.set(band, (bands.get(band) || 0) + 1)
  }
  let mostActive = ''
  let mostActiveCount = 0
  for (const [band, n] of bands) {
    if (n > mostActiveCount) {
      mostActive = band
      mostActiveCount = n
    }
  }

  const now = new Date()
  const monthStamps = sorted.filter((s) => {
    const d = new Date(s.earned_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const locations = new Set(sorted.map((s) => s.location))
  const streak = currentStreak(sorted)
  const monthName = now.toLocaleDateString('en-GB', { month: 'long' })

  return [
    {
      id: 'first-visit',
      title: 'First Visit',
      value: first ? formatLong(first.earned_at) : 'Awaiting first ink',
      detail: first
        ? `${first.location} · ${first.label}`
        : 'Verify a visit or complete an order to open the book.',
      unlocked: Boolean(first),
    },
    {
      id: 'first-spanish',
      title: 'First Spanish Latte',
      value: spanish ? formatLong(spanish.earned_at) : 'Not yet poured',
      detail: spanish
        ? `Sealed in ${spanish.location}`
        : 'Order a Spanish Latte to mark this chapter.',
      unlocked: Boolean(spanish),
    },
    {
      id: 'favorite-drink',
      title: 'Favorite Drink',
      value: favorite || 'Still discovering',
      detail: favorite
        ? `Ordered ${favoriteCount} time${favoriteCount === 1 ? '' : 's'}`
        : 'Your most-inked pour will appear here.',
      unlocked: Boolean(favorite),
    },
    {
      id: 'most-active',
      title: 'Most Active Time',
      value: mostActive || 'Unwritten',
      detail: mostActive
        ? `${mostActiveCount} seal${mostActiveCount === 1 ? '' : 's'} in this light`
        : 'When you return most often will settle here.',
      unlocked: Boolean(mostActive),
    },
    {
      id: 'current-streak',
      title: 'Current Streak',
      value: streak > 0 ? `${streak} day${streak === 1 ? '' : 's'}` : 'No active streak',
      detail:
        streak > 0
          ? 'Consecutive days with a seal in the book.'
          : 'Visit today to start a quiet rhythm.',
      unlocked: streak > 0,
    },
    {
      id: 'this-month',
      title: 'This Month',
      value: `${monthStamps.length} seal${monthStamps.length === 1 ? '' : 's'}`,
      detail: `${monthName} · ${locations.size ? [...locations].slice(0, 2).join(' · ') : 'No houses yet'}`,
      unlocked: monthStamps.length > 0,
    },
    {
      id: 'lifetime',
      title: 'Lifetime Stats',
      value: `${sorted.length} seal${sorted.length === 1 ? '' : 's'}`,
      detail: sorted.length
        ? `${locations.size} house${locations.size === 1 ? '' : 's'} · ${drinkCounts.size} distinct pour${drinkCounts.size === 1 ? '' : 's'}`
        : 'Your lifetime ledger begins with the first crossing.',
      unlocked: sorted.length > 0,
    },
  ]
}
