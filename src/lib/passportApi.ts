import {
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_REWARDS,
  DEFAULT_STAMP_RULES,
} from '../data/passportDefaults'
import { isSupabaseConfigured, supabase } from './supabase'
import {
  createLocalProfile,
  evaluateAchievements,
  loadPassportDb,
  pickInk,
  savePassportDb,
  syncRewards,
  uid,
} from './passportStore'
import type {
  Achievement,
  PassportBundle,
  PassportProfile,
  PassportStamp,
  Reward,
  StampRule,
  UserAchievement,
  UserReward,
} from './passportTypes'

function bakeryFromLabel(label: string, pastry?: string) {
  if (pastry) return true
  return /croissant|pastry|bakery|cheesecake|sando|sourdough/i.test(label)
}

export async function getSessionProfile(): Promise<PassportProfile | null> {
  if (supabase) {
    const { data: session } = await supabase.auth.getSession()
    const user = session.session?.user
    if (!user) return null
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if (data) {
      return {
        id: data.id,
        full_name: data.full_name || user.email?.split('@')[0] || 'Traveller',
        email: data.email || user.email || '',
        phone: data.phone || undefined,
        passport_number: data.passport_number,
        is_admin: Boolean(data.is_admin),
      }
    }
    return {
      id: user.id,
      full_name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Traveller',
      email: user.email || '',
      passport_number: `DRIP-${user.id.slice(0, 8).toUpperCase()}`,
      is_admin: false,
    }
  }

  const db = loadPassportDb()
  if (!db.sessionUserId) return null
  return db.profiles.find((p) => p.id === db.sessionUserId) || null
}

export async function signUpLocalOrRemote(email: string, password: string, fullName: string) {
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data.user
  }

  const db = loadPassportDb()
  const existing = db.profiles.find((p) => p.email === email.trim().toLowerCase())
  if (existing) throw new Error('An account with this email already exists.')
  const isAdmin = email.toLowerCase().includes('admin')
  const profile = createLocalProfile(email, fullName, isAdmin)
  db.profiles.push(profile)
  db.sessionUserId = profile.id
  savePassportDb(db)
  localStorage.setItem(`drip-pass-${profile.id}`, password)
  return profile
}

export async function signInLocalOrRemote(email: string, password: string) {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.user
  }

  const db = loadPassportDb()
  const profile = db.profiles.find((p) => p.email === email.trim().toLowerCase())
  if (!profile) throw new Error('No passport found for this email. Issue one first.')
  const stored = localStorage.getItem(`drip-pass-${profile.id}`)
  if (stored && stored !== password) throw new Error('Incorrect password.')
  if (!stored) localStorage.setItem(`drip-pass-${profile.id}`, password)
  db.sessionUserId = profile.id
  savePassportDb(db)
  return profile
}

export async function signOutLocalOrRemote() {
  if (supabase) {
    await supabase.auth.signOut()
    return
  }
  const db = loadPassportDb()
  db.sessionUserId = null
  savePassportDb(db)
}

export async function fetchPassportBundle(userId: string): Promise<PassportBundle> {
  if (supabase) {
    const [profileRes, stampsRes, rewardsRes, urRes, achRes, uaRes, rulesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('passport_stamps').select('*').eq('user_id', userId).order('earned_at'),
      supabase.from('rewards').select('*').eq('active', true).order('sort_order'),
      supabase.from('user_rewards').select('*').eq('user_id', userId),
      supabase.from('achievements').select('*').eq('active', true),
      supabase.from('user_achievements').select('*').eq('user_id', userId),
      supabase.from('stamp_rules').select('*').eq('active', true),
    ])

    const profile: PassportProfile = profileRes.data
      ? {
          id: profileRes.data.id,
          full_name: profileRes.data.full_name || 'Traveller',
          email: profileRes.data.email || '',
          phone: profileRes.data.phone || undefined,
          passport_number: profileRes.data.passport_number,
          is_admin: Boolean(profileRes.data.is_admin),
        }
      : {
          id: userId,
          full_name: 'Traveller',
          email: '',
          passport_number: `DRIP-${userId.slice(0, 8).toUpperCase()}`,
          is_admin: false,
        }

    return {
      profile,
      stamps: (stampsRes.data || []) as PassportStamp[],
      rewards: ((rewardsRes.data || []) as Reward[]).length
        ? (rewardsRes.data as Reward[])
        : DEFAULT_REWARDS,
      unlockedRewards: (urRes.data || []) as UserReward[],
      achievements: ((achRes.data || []) as Achievement[]).length
        ? (achRes.data as Achievement[])
        : DEFAULT_ACHIEVEMENTS,
      unlockedAchievements: (uaRes.data || []) as UserAchievement[],
      rules: ((rulesRes.data || []) as StampRule[]).length
        ? (rulesRes.data as StampRule[])
        : DEFAULT_STAMP_RULES,
    }
  }

  const db = loadPassportDb()
  const profile = db.profiles.find((p) => p.id === userId)
  if (!profile) throw new Error('Profile missing')
  return {
    profile,
    stamps: db.stamps.filter((s) => s.user_id === userId).sort((a, b) => a.earned_at.localeCompare(b.earned_at)),
    rewards: db.rewards.filter((r) => r.active).sort((a, b) => a.sort_order - b.sort_order),
    unlockedRewards: db.userRewards.filter((u) => u.user_id === userId),
    achievements: db.achievements.filter((a) => a.active),
    unlockedAchievements: db.userAchievements.filter((u) => u.user_id === userId),
    rules: db.rules.filter((r) => r.active),
  }
}

export type EarnStampInput = {
  userId: string
  ruleKey: string
  label: string
  location?: string
  drink?: string
  pastry?: string
  category?: string
  sourceRef?: string
}

export async function earnStamp(input: EarnStampInput): Promise<{
  stamps: PassportStamp[]
  newAchievementIds: string[]
  newRewardIds: string[]
}> {
  const now = new Date()
  const hour = now.getHours()
  const weekend = now.getDay() === 0 || now.getDay() === 6

  if (supabase) {
    const rule = (await supabase.from('stamp_rules').select('*').eq('key', input.ruleKey).maybeSingle()).data
    const count = rule?.stamps_awarded ?? 1
    const created: PassportStamp[] = []
    for (let i = 0; i < count; i++) {
      const row = {
        user_id: input.userId,
        rule_key: input.ruleKey,
        label: input.label,
        location: input.location || 'Gulberg',
        ink_color: pickInk(Date.now() + i),
        source_ref: input.sourceRef || null,
      }
      const { data, error } = await supabase.from('passport_stamps').insert(row).select().single()
      if (error) throw error
      created.push(data as PassportStamp)
    }

    const bundle = await fetchPassportBundle(input.userId)
    const stampsWithMeta = [
      ...bundle.stamps.map((s) =>
        created.some((c) => c.id === s.id)
          ? {
              ...s,
              meta: {
                drink: input.drink,
                pastry: input.pastry,
                category: input.category || (bakeryFromLabel(input.label, input.pastry) ? 'bakery' : undefined),
                weekend: input.ruleKey === 'visit_verified' ? weekend : undefined,
                hour,
              },
            }
          : s,
      ),
    ]

    // achievements / rewards via client insert (demo-friendly)
    const newAch = evaluateAchievements(
      stampsWithMeta,
      bundle.achievements,
      bundle.unlockedAchievements,
      input.userId,
    )
    for (const a of newAch) {
      await supabase.from('user_achievements').upsert({
        user_id: a.user_id,
        achievement_id: a.achievement_id,
        unlocked_at: a.unlocked_at,
      })
    }
    const newRew = syncRewards(
      stampsWithMeta.length,
      bundle.rewards,
      bundle.unlockedRewards,
      input.userId,
    )
    for (const r of newRew) {
      await supabase.from('user_rewards').upsert({
        user_id: r.user_id,
        reward_id: r.reward_id,
        unlocked_at: r.unlocked_at,
        claimed: false,
      })
    }

    return {
      stamps: created,
      newAchievementIds: newAch.map((a) => a.achievement_id),
      newRewardIds: newRew.map((r) => r.reward_id),
    }
  }

  const db = loadPassportDb()
  const rule = db.rules.find((r) => r.key === input.ruleKey && r.active)
  const count = rule?.stamps_awarded ?? 1
  const created: PassportStamp[] = []
  for (let i = 0; i < count; i++) {
    const stamp: PassportStamp = {
      id: uid(),
      user_id: input.userId,
      rule_key: input.ruleKey,
      label: input.label,
      location: input.location || 'Gulberg',
      ink_color: pickInk(db.stamps.length + i),
      page_slot: db.stamps.filter((s) => s.user_id === input.userId).length + i,
      source_ref: input.sourceRef,
      earned_at: now.toISOString(),
      meta: {
        drink: input.drink,
        pastry: input.pastry,
        category: input.category || (bakeryFromLabel(input.label, input.pastry) ? 'bakery' : undefined),
        weekend: input.ruleKey === 'visit_verified' ? weekend : weekend,
        hour,
      },
    }
    db.stamps.push(stamp)
    created.push(stamp)
  }

  const userStamps = db.stamps.filter((s) => s.user_id === input.userId)
  const unlockedAch = db.userAchievements.filter((u) => u.user_id === input.userId)
  const newAch = evaluateAchievements(userStamps, db.achievements, unlockedAch, input.userId)
  db.userAchievements.push(...newAch)

  const unlockedRew = db.userRewards.filter((u) => u.user_id === input.userId)
  const newRew = syncRewards(userStamps.length, db.rewards, unlockedRew, input.userId)
  db.userRewards.push(...newRew)

  savePassportDb(db)
  return {
    stamps: created,
    newAchievementIds: newAch.map((a) => a.achievement_id),
    newRewardIds: newRew.map((r) => r.reward_id),
  }
}

export async function verifyVisit(userId: string, code: string, location = 'Gulberg') {
  const normalized = code.trim().toUpperCase()
  if (normalized !== 'DRIP-GULBERG' && normalized !== 'DRIP-DHA' && normalized !== 'DRIP-ADDA') {
    throw new Error('Unknown house seal. Ask your barista for today’s verification code.')
  }
  const loc =
    normalized === 'DRIP-DHA' ? 'DHA Phase 4' : normalized === 'DRIP-ADDA' ? 'Adda Plot' : location
  return earnStamp({
    userId,
    ruleKey: 'visit_verified',
    label: `Verified · ${loc}`,
    location: loc,
    sourceRef: normalized,
  })
}

export async function completeOrderStamp(
  userId: string,
  opts: { drink: string; pastry?: string; fromRitual?: boolean },
) {
  return earnStamp({
    userId,
    ruleKey: opts.fromRitual ? 'ritual_completed' : 'order_completed',
    label: opts.pastry ? `${opts.drink} · ${opts.pastry}` : opts.drink,
    drink: opts.drink,
    pastry: opts.pastry,
    category: opts.pastry ? 'bakery' : undefined,
  })
}

/* ——— Admin CRUD (local + supabase) ——— */

export async function adminListConfig() {
  if (supabase) {
    const [rules, rewards, achievements] = await Promise.all([
      supabase.from('stamp_rules').select('*').order('created_at'),
      supabase.from('rewards').select('*').order('sort_order'),
      supabase.from('achievements').select('*').order('created_at'),
    ])
    return {
      rules: (rules.data as StampRule[]) || DEFAULT_STAMP_RULES,
      rewards: (rewards.data as Reward[]) || DEFAULT_REWARDS,
      achievements: (achievements.data as Achievement[]) || DEFAULT_ACHIEVEMENTS,
    }
  }
  const db = loadPassportDb()
  return { rules: db.rules, rewards: db.rewards, achievements: db.achievements }
}

export async function adminSaveReward(reward: Partial<Reward> & { title: string; stamps_required: number; perk: string }) {
  if (supabase) {
    if (reward.id) {
      await supabase.from('rewards').update(reward).eq('id', reward.id)
    } else {
      await supabase.from('rewards').insert({
        title: reward.title,
        description: reward.description || '',
        stamps_required: reward.stamps_required,
        perk: reward.perk,
        active: reward.active ?? true,
        sort_order: reward.sort_order ?? 99,
      })
    }
    return
  }
  const db = loadPassportDb()
  if (reward.id) {
    db.rewards = db.rewards.map((r) => (r.id === reward.id ? { ...r, ...reward } as Reward : r))
  } else {
    db.rewards.push({
      id: uid(),
      title: reward.title,
      description: reward.description || '',
      stamps_required: reward.stamps_required,
      perk: reward.perk,
      active: reward.active ?? true,
      sort_order: reward.sort_order ?? db.rewards.length + 1,
    })
  }
  savePassportDb(db)
}

export async function adminSaveRule(rule: Partial<StampRule> & { key: string; title: string; event_type: StampRule['event_type'] }) {
  if (supabase) {
    if (rule.id) await supabase.from('stamp_rules').update(rule).eq('id', rule.id)
    else {
      await supabase.from('stamp_rules').insert({
        key: rule.key,
        title: rule.title,
        description: rule.description || '',
        event_type: rule.event_type,
        stamps_awarded: rule.stamps_awarded ?? 1,
        active: rule.active ?? true,
      })
    }
    return
  }
  const db = loadPassportDb()
  if (rule.id) {
    db.rules = db.rules.map((r) => (r.id === rule.id ? { ...r, ...rule } as StampRule : r))
  } else {
    db.rules.push({
      id: uid(),
      key: rule.key,
      title: rule.title,
      description: rule.description || '',
      event_type: rule.event_type,
      stamps_awarded: rule.stamps_awarded ?? 1,
      active: rule.active ?? true,
    })
  }
  savePassportDb(db)
}

export async function adminSaveAchievement(
  ach: Partial<Achievement> & { key: string; title: string; description: string },
) {
  if (supabase) {
    if (ach.id) await supabase.from('achievements').update(ach).eq('id', ach.id)
    else {
      await supabase.from('achievements').insert({
        key: ach.key,
        title: ach.title,
        description: ach.description,
        icon: ach.icon || 'seal',
        criteria: ach.criteria || {},
        active: ach.active ?? true,
      })
    }
    return
  }
  const db = loadPassportDb()
  if (ach.id) {
    db.achievements = db.achievements.map((a) =>
      a.id === ach.id ? ({ ...a, ...ach } as Achievement) : a,
    )
  } else {
    db.achievements.push({
      id: uid(),
      key: ach.key,
      title: ach.title,
      description: ach.description,
      icon: ach.icon || 'seal',
      criteria: ach.criteria || {},
      active: ach.active ?? true,
    })
  }
  savePassportDb(db)
}

export async function adminToggleReward(id: string, active: boolean) {
  if (supabase) {
    await supabase.from('rewards').update({ active }).eq('id', id)
    return
  }
  const db = loadPassportDb()
  db.rewards = db.rewards.map((r) => (r.id === id ? { ...r, active } : r))
  savePassportDb(db)
}

export async function adminToggleRule(id: string, active: boolean) {
  if (supabase) {
    await supabase.from('stamp_rules').update({ active }).eq('id', id)
    return
  }
  const db = loadPassportDb()
  db.rules = db.rules.map((r) => (r.id === id ? { ...r, active } : r))
  savePassportDb(db)
}

export async function adminToggleAchievement(id: string, active: boolean) {
  if (supabase) {
    await supabase.from('achievements').update({ active }).eq('id', id)
    return
  }
  const db = loadPassportDb()
  db.achievements = db.achievements.map((a) => (a.id === id ? { ...a, active } : a))
  savePassportDb(db)
}

export { isSupabaseConfigured }
