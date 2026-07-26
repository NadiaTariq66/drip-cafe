import {
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_REWARDS,
  DEFAULT_STAMP_RULES,
  INK_PALETTE,
  makePassportNumber,
} from '../data/passportDefaults'
import type {
  Achievement,
  PassportProfile,
  PassportStamp,
  Reward,
  StampRule,
  UserAchievement,
  UserReward,
} from './passportTypes'

const KEY = 'drip-passport-v1'

export interface LocalPassportDB {
  profiles: PassportProfile[]
  stamps: PassportStamp[]
  rewards: Reward[]
  userRewards: UserReward[]
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  rules: StampRule[]
  sessionUserId: string | null
}

function emptyDb(): LocalPassportDB {
  return {
    profiles: [],
    stamps: [],
    rewards: structuredClone(DEFAULT_REWARDS),
    userRewards: [],
    achievements: structuredClone(DEFAULT_ACHIEVEMENTS),
    userAchievements: [],
    rules: structuredClone(DEFAULT_STAMP_RULES),
    sessionUserId: null,
  }
}

export function loadPassportDb(): LocalPassportDB {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyDb()
    const parsed = JSON.parse(raw) as LocalPassportDB
    return {
      ...emptyDb(),
      ...parsed,
      rewards: parsed.rewards?.length ? parsed.rewards : structuredClone(DEFAULT_REWARDS),
      achievements: parsed.achievements?.length
        ? parsed.achievements
        : structuredClone(DEFAULT_ACHIEVEMENTS),
      rules: parsed.rules?.length ? parsed.rules : structuredClone(DEFAULT_STAMP_RULES),
    }
  } catch {
    return emptyDb()
  }
}

export function savePassportDb(db: LocalPassportDB) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

export function uid() {
  return crypto.randomUUID()
}

export function createLocalProfile(email: string, fullName: string, isAdmin = false): PassportProfile {
  return {
    id: uid(),
    email: email.trim().toLowerCase(),
    full_name: fullName.trim() || email.split('@')[0],
    passport_number: makePassportNumber(),
    is_admin: isAdmin,
  }
}

export function pickInk(index: number) {
  return INK_PALETTE[index % INK_PALETTE.length]
}

export function evaluateAchievements(
  stamps: PassportStamp[],
  achievements: Achievement[],
  unlocked: UserAchievement[],
  userId: string,
): UserAchievement[] {
  const newly: UserAchievement[] = []
  const unlockedKeys = new Set(
    unlocked
      .map((u) => achievements.find((a) => a.id === u.achievement_id)?.key)
      .filter(Boolean),
  )

  for (const ach of achievements.filter((a) => a.active)) {
    if (unlockedKeys.has(ach.key)) continue
    const c = ach.criteria
    let ok = false

    if (typeof c.drink_contains === 'string' && typeof c.count === 'number') {
      const n = stamps.filter((s) =>
        (s.meta?.drink || s.label).toLowerCase().includes(String(c.drink_contains).toLowerCase()),
      ).length
      ok = n >= c.count
    } else if (c.category === 'bakery' && typeof c.count === 'number') {
      const n = stamps.filter(
        (s) =>
          s.meta?.category === 'bakery' ||
          /croissant|pastry|bakery|cheesecake|sando|sourdough/i.test(s.label),
      ).length
      ok = n >= c.count
    } else if (typeof c.weekend_visits === 'number') {
      const n = stamps.filter(
        (s) => s.meta?.weekend || (s.rule_key === 'visit_verified' && isWeekend(s.earned_at)),
      ).length
      ok = n >= c.weekend_visits
    } else if (typeof c.before_hour === 'number' && typeof c.count === 'number') {
      const beforeHour = c.before_hour
      const n = stamps.filter((s) => (s.meta?.hour ?? 12) < beforeHour).length
      ok = n >= c.count
    }

    if (ok) {
      newly.push({
        id: uid(),
        user_id: userId,
        achievement_id: ach.id,
        unlocked_at: new Date().toISOString(),
      })
    }
  }
  return newly
}

function isWeekend(iso: string) {
  const d = new Date(iso).getDay()
  return d === 0 || d === 6
}

export function syncRewards(
  stampCount: number,
  rewards: Reward[],
  unlocked: UserReward[],
  userId: string,
): UserReward[] {
  const have = new Set(unlocked.map((u) => u.reward_id))
  const newly: UserReward[] = []
  for (const r of rewards.filter((x) => x.active)) {
    if (stampCount >= r.stamps_required && !have.has(r.id)) {
      newly.push({
        id: uid(),
        user_id: userId,
        reward_id: r.id,
        unlocked_at: new Date().toISOString(),
        claimed: false,
      })
    }
  }
  return newly
}
