import type { Reward, UserReward } from '../../lib/passportTypes'

type Props = {
  rewards: Reward[]
  unlocked: UserReward[]
  stampCount: number
  highlightIds?: string[]
}

export function RewardTimeline({ rewards, unlocked, stampCount, highlightIds = [] }: Props) {
  const unlockedSet = new Set(unlocked.map((u) => u.reward_id))

  return (
    <div className="space-y-4" data-reveal>
      {rewards.map((r) => {
        const got = unlockedSet.has(r.id) || stampCount >= r.stamps_required
        const progress = Math.min(100, Math.round((stampCount / r.stamps_required) * 100))
        const glow = highlightIds.includes(r.id)
        return (
          <div
            key={r.id}
            className={`border rounded-sm p-6 ${
              got ? 'border-bronze/40 bg-soot' : 'border-cream/10 bg-coal'
            } ${glow ? 'ring-1 ring-bronzelight' : ''}`}
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[.5rem] tracking-[.35em] text-bronze">
                  {r.stamps_required} SEALS · {got ? 'UNLOCKED' : `${stampCount}/${r.stamps_required}`}
                </p>
                <h3 className="font-serif text-2xl text-cream mt-2">{r.title}</h3>
                <p className="text-sm text-cream/50 mt-1">{r.description}</p>
              </div>
              <p className="font-script text-2xl text-bronzelight">{r.perk}</p>
            </div>
            <div className="mt-4 h-px bg-cream/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-bronze to-bronzelight transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
