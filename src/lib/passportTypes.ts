export type StampEventType = 'order_completed' | 'visit_verified' | 'ritual_completed' | 'manual'

export interface PassportProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  passport_number: string
  is_admin: boolean
}

export interface StampRule {
  id: string
  key: string
  title: string
  description: string
  event_type: StampEventType
  stamps_awarded: number
  active: boolean
  metadata?: Record<string, unknown>
}

export interface PassportStamp {
  id: string
  user_id: string
  rule_key: string
  label: string
  location: string
  ink_color: string
  page_slot?: number | null
  source_ref?: string | null
  earned_at: string
  meta?: {
    drink?: string
    pastry?: string
    category?: string
    weekend?: boolean
    hour?: number
  }
}

export interface Reward {
  id: string
  title: string
  description: string
  stamps_required: number
  perk: string
  active: boolean
  sort_order: number
}

export interface UserReward {
  id: string
  user_id: string
  reward_id: string
  unlocked_at: string
  claimed: boolean
}

export interface Achievement {
  id: string
  key: string
  title: string
  description: string
  icon: string
  criteria: Record<string, unknown>
  active: boolean
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

export interface PassportBundle {
  profile: PassportProfile
  stamps: PassportStamp[]
  rewards: Reward[]
  unlockedRewards: UserReward[]
  achievements: Achievement[]
  unlockedAchievements: UserAchievement[]
  rules: StampRule[]
}
