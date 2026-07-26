import type { Achievement, UserAchievement } from '../../lib/passportTypes'

const ICONS: Record<string, string> = {
  espresso: '◎',
  leaf: '☘',
  croissant: '✦',
  calendar: '◷',
  sun: '✧',
  seal: '❖',
}

type Props = {
  achievements: Achievement[]
  unlocked: UserAchievement[]
  highlightIds?: string[]
}

export function AchievementGrid({ achievements, unlocked, highlightIds = [] }: Props) {
  const unlockedSet = new Set(unlocked.map((u) => u.achievement_id))

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-reveal>
      {achievements.map((a) => {
        const got = unlockedSet.has(a.id)
        const glow = highlightIds.includes(a.id)
        return (
          <article
            key={a.id}
            className={`border rounded-sm p-6 transition-all duration-500 ${
              got
                ? 'border-bronze/50 bg-gradient-to-br from-walnut/50 to-soot'
                : 'border-cream/10 bg-coal/60 opacity-70'
            } ${glow ? 'ring-1 ring-bronzelight shadow-[0_0_40px_-10px_rgba(183,138,82,.6)]' : ''}`}
            data-hover
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`text-2xl ${got ? 'text-bronzelight' : 'text-cream/25'}`}>
                {ICONS[a.icon] || ICONS.seal}
              </span>
              <span className="text-[.45rem] tracking-[.3em] text-bronze">
                {got ? 'COLLECTED' : 'LOCKED'}
              </span>
            </div>
            <h3 className="font-serif text-2xl text-cream mt-4">{a.title}</h3>
            <p className="mt-2 text-sm text-cream/50 leading-relaxed">{a.description}</p>
          </article>
        )
      })}
    </div>
  )
}
