import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  adminListConfig,
  adminSaveAchievement,
  adminSaveReward,
  adminSaveRule,
  adminToggleAchievement,
  adminToggleReward,
  adminToggleRule,
  isSupabaseConfigured,
} from '../lib/passportApi'
import type { Achievement, Reward, StampRule } from '../lib/passportTypes'
import { useReveal } from '../hooks/useReveal'

type Tab = 'rewards' | 'rules' | 'achievements'

export function PassportAdmin() {
  const { profile, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('rewards')
  const [rules, setRules] = useState<StampRule[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [msg, setMsg] = useState('')

  const refresh = useCallback(async () => {
    const data = await adminListConfig()
    setRules(data.rules)
    setRewards(data.rewards)
    setAchievements(data.achievements)
  }, [])

  useEffect(() => {
    document.title = 'Passport Admin — DRIP'
    refresh()
  }, [refresh])

  useReveal([tab, rewards.length, rules.length, achievements.length])

  if (loading) return null
  if (!profile) return <Navigate to="/passport" replace />
  if (!profile.is_admin) {
    return (
      <div className="pt-40 pb-28 px-6 text-center">
        <h1 className="font-serif text-4xl text-cream">Restricted ledger</h1>
        <p className="mt-4 text-cream/50">Admin access required.</p>
        <Link to="/passport" className="link-lux inline-block mt-8 text-[.65rem] tracking-[.3em] text-bronzelight">
          BACK TO PASSPORT
        </Link>
      </div>
    )
  }

  async function flash(text: string) {
    setMsg(text)
    await refresh()
    setTimeout(() => setMsg(''), 2500)
  }

  async function onReward(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await adminSaveReward({
      title: String(fd.get('title')),
      description: String(fd.get('description') || ''),
      stamps_required: Number(fd.get('stamps_required')),
      perk: String(fd.get('perk')),
      sort_order: Number(fd.get('sort_order') || 99),
      active: true,
    })
    e.currentTarget.reset()
    flash('Reward saved')
  }

  async function onRule(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await adminSaveRule({
      key: String(fd.get('key')).trim().toLowerCase().replace(/\s+/g, '_'),
      title: String(fd.get('title')),
      description: String(fd.get('description') || ''),
      event_type: String(fd.get('event_type')) as StampRule['event_type'],
      stamps_awarded: Number(fd.get('stamps_awarded') || 1),
      active: true,
    })
    e.currentTarget.reset()
    flash('Stamp rule saved')
  }

  async function onAchievement(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const drink = String(fd.get('drink_contains') || '')
    const count = Number(fd.get('count') || 1)
    await adminSaveAchievement({
      key: String(fd.get('key')).trim().toLowerCase().replace(/\s+/g, '_'),
      title: String(fd.get('title')),
      description: String(fd.get('description')),
      icon: String(fd.get('icon') || 'seal'),
      criteria: drink ? { drink_contains: drink, count } : { count },
      active: true,
    })
    e.currentTarget.reset()
    flash('Achievement saved')
  }

  return (
    <div className="pt-36 pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
              <span className="eyebrow-line" /> PASSPORT ADMIN
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-cream" data-split>
              Ledger of seals
            </h1>
            <p className="mt-4 text-cream/50 max-w-xl" data-reveal>
              Configure stamp rules, milestone rewards, and achievement definitions. Travellers feel a
              passport — never a punch card.
            </p>
          </div>
          <div className="flex gap-3" data-reveal>
            <span
              className={`text-[.55rem] tracking-[.3em] px-4 py-2 border ${
                isSupabaseConfigured
                  ? 'border-emerald-500/40 text-emerald-400/90'
                  : 'border-bronze/40 text-bronzelight'
              }`}
            >
              {isSupabaseConfigured ? 'SUPABASE' : 'LOCAL DEMO'}
            </span>
            <Link to="/passport" className="btn-ghost px-5 py-2 text-[.55rem]">
              VIEW PASSPORT
            </Link>
          </div>
        </div>

        {msg && (
          <p className="mb-6 text-[.6rem] tracking-[.3em] text-bronzelight" data-reveal>
            {msg.toUpperCase()}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-10" data-reveal>
          {(
            [
              ['rewards', 'REWARDS'],
              ['rules', 'STAMP RULES'],
              ['achievements', 'ACHIEVEMENTS'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-5 py-2.5 text-[.58rem] tracking-[.3em] border ${
                tab === id
                  ? 'border-bronze text-bronzelight bg-bronze/10'
                  : 'border-cream/15 text-cream/45'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'rewards' && (
          <div className="grid lg:grid-cols-2 gap-10">
            <form onSubmit={onReward} className="bg-coal border border-cream/10 p-8 space-y-5" data-reveal>
              <p className="text-[.55rem] tracking-[.4em] text-bronze">NEW REWARD</p>
              <input name="title" className="field" placeholder="Title" required />
              <input name="description" className="field" placeholder="Description" />
              <input name="perk" className="field" placeholder="Perk (e.g. Private tasting)" required />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="stamps_required"
                  type="number"
                  min={1}
                  className="field"
                  placeholder="Stamps required"
                  required
                />
                <input name="sort_order" type="number" className="field" placeholder="Sort order" />
              </div>
              <button type="submit" className="btn-primary w-full py-3 text-[.58rem] font-medium">
                SAVE REWARD
              </button>
            </form>
            <div className="space-y-3" data-reveal>
              {rewards.map((r) => (
                <div key={r.id} className="border border-cream/10 p-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-xl text-cream">{r.title}</p>
                    <p className="text-sm text-cream/45 mt-1">
                      {r.stamps_required} seals · {r.perk}
                    </p>
                  </div>
                  <button
                    className="text-[.5rem] tracking-[.25em] text-bronzelight"
                    onClick={async () => {
                      await adminToggleReward(r.id, !r.active)
                      flash(r.active ? 'Reward deactivated' : 'Reward activated')
                    }}
                  >
                    {r.active ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'rules' && (
          <div className="grid lg:grid-cols-2 gap-10">
            <form onSubmit={onRule} className="bg-coal border border-cream/10 p-8 space-y-5" data-reveal>
              <p className="text-[.55rem] tracking-[.4em] text-bronze">NEW STAMP RULE</p>
              <input name="key" className="field" placeholder="key_snake_case" required />
              <input name="title" className="field" placeholder="Title" required />
              <input name="description" className="field" placeholder="Description" />
              <select name="event_type" className="field" defaultValue="manual">
                <option value="order_completed">order_completed</option>
                <option value="visit_verified">visit_verified</option>
                <option value="ritual_completed">ritual_completed</option>
                <option value="manual">manual</option>
              </select>
              <input
                name="stamps_awarded"
                type="number"
                min={1}
                defaultValue={1}
                className="field"
                placeholder="Stamps awarded"
              />
              <button type="submit" className="btn-primary w-full py-3 text-[.58rem] font-medium">
                SAVE RULE
              </button>
            </form>
            <div className="space-y-3" data-reveal>
              {rules.map((r) => (
                <div key={r.id} className="border border-cream/10 p-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-xl text-cream">{r.title}</p>
                    <p className="text-sm text-cream/45 mt-1">
                      {r.key} · {r.event_type} · +{r.stamps_awarded}
                    </p>
                  </div>
                  <button
                    className="text-[.5rem] tracking-[.25em] text-bronzelight"
                    onClick={async () => {
                      await adminToggleRule(r.id, !r.active)
                      flash(r.active ? 'Rule off' : 'Rule on')
                    }}
                  >
                    {r.active ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'achievements' && (
          <div className="grid lg:grid-cols-2 gap-10">
            <form
              onSubmit={onAchievement}
              className="bg-coal border border-cream/10 p-8 space-y-5"
              data-reveal
            >
              <p className="text-[.55rem] tracking-[.4em] text-bronze">NEW ACHIEVEMENT</p>
              <input name="key" className="field" placeholder="key_snake_case" required />
              <input name="title" className="field" placeholder="Title" required />
              <input name="description" className="field" placeholder="Description" required />
              <select name="icon" className="field" defaultValue="seal">
                <option value="espresso">espresso</option>
                <option value="leaf">leaf</option>
                <option value="croissant">croissant</option>
                <option value="calendar">calendar</option>
                <option value="sun">sun</option>
                <option value="seal">seal</option>
              </select>
              <input name="drink_contains" className="field" placeholder="Drink contains (optional)" />
              <input name="count" type="number" min={1} defaultValue={1} className="field" />
              <button type="submit" className="btn-primary w-full py-3 text-[.58rem] font-medium">
                SAVE ACHIEVEMENT
              </button>
            </form>
            <div className="space-y-3" data-reveal>
              {achievements.map((a) => (
                <div key={a.id} className="border border-cream/10 p-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-xl text-cream">{a.title}</p>
                    <p className="text-sm text-cream/45 mt-1">{a.description}</p>
                  </div>
                  <button
                    className="text-[.5rem] tracking-[.25em] text-bronzelight"
                    onClick={async () => {
                      await adminToggleAchievement(a.id, !a.active)
                      flash(a.active ? 'Achievement off' : 'Achievement on')
                    }}
                  >
                    {a.active ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
