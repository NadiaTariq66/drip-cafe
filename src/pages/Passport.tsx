import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { AchievementGrid } from '../components/passport/AchievementGrid'
import { JourneyTrail } from '../components/passport/JourneyTrail'
import { PassportAuth } from '../components/passport/PassportAuth'
import { PassportBook } from '../components/passport/PassportBook'
import { RewardTimeline } from '../components/passport/RewardTimeline'
import { useAuth } from '../context/AuthContext'
import {
  completeOrderStamp,
  fetchPassportBundle,
  verifyVisit,
} from '../lib/passportApi'
import { buildJourney } from '../lib/passportJourney'
import type { PassportBundle } from '../lib/passportTypes'
import { useReveal } from '../hooks/useReveal'

export function Passport() {
  const { profile, loading, signOut } = useAuth()
  const [bundle, setBundle] = useState<PassportBundle | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [newStampIds, setNewStampIds] = useState<string[]>([])
  const [newAchIds, setNewAchIds] = useState<string[]>([])
  const [newRewIds, setNewRewIds] = useState<string[]>([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!profile) {
      setBundle(null)
      return
    }
    const data = await fetchPassportBundle(profile.id)
    setBundle(data)
  }, [profile])

  useEffect(() => {
    document.title = 'Drip Passport — DRIP'
    load()
  }, [load])

  useReveal([!!profile, bundle?.stamps.length, toast])

  useEffect(() => {
    if (!toast) return
    gsap.fromTo('#passport-toast', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
    const t = setTimeout(() => setToast(''), 4200)
    return () => clearTimeout(t)
  }, [toast])

  const journey = useMemo(
    () => (bundle ? buildJourney(bundle.stamps) : []),
    [bundle],
  )

  async function afterEarn(result: Awaited<ReturnType<typeof completeOrderStamp>>) {
    setNewStampIds(result.stamps.map((s) => s.id))
    setNewAchIds(result.newAchievementIds)
    setNewRewIds(result.newRewardIds)
    await load()
    const bits = [`+${result.stamps.length} seal inked`]
    if (result.newAchievementIds.length) bits.push('achievement unlocked')
    if (result.newRewardIds.length) bits.push('corridor opened')
    setToast(bits.join(' · '))
  }

  async function onVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!profile) return
    setError('')
    setBusy(true)
    try {
      const code = String(new FormData(e.currentTarget).get('code') || '')
      const result = await verifyVisit(profile.id, code)
      await afterEarn(result)
      e.currentTarget.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setBusy(false)
    }
  }

  async function stampOrder(drink: string, pastry?: string, fromRitual?: boolean) {
    if (!profile) return
    setBusy(true)
    setError('')
    try {
      const result = await completeOrderStamp(profile.id, { drink, pastry, fromRitual })
      await afterEarn(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not ink stamp')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-40 pb-28 text-center text-[.65rem] tracking-[.4em] text-cream/40">
        OPENING THE LEDGER…
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="pt-36 pb-28 px-6 md:px-10">
        <PassportAuth />
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="pt-40 pb-28 text-center text-cream/40">Loading your book…</div>
    )
  }

  return (
    <div className="pt-36 pb-28 relative">
      {toast && (
        <div
          id="passport-toast"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] bg-ink/95 border border-bronze/50 px-6 py-3 text-[.6rem] tracking-[.3em] text-bronzelight backdrop-blur"
        >
          {toast.toUpperCase()}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
              <span className="eyebrow-line" /> DRIP PASSPORT
            </p>
            <h1 className="font-serif text-5xl md:text-7xl text-cream" data-split>
              Traveller’s book
            </h1>
            <p className="mt-4 text-cream/50 max-w-xl" data-reveal>
              Welcome back, {profile.full_name}. Collect seals like cities — Spanish Latte mornings,
              bakery afternoons, verified evenings in Gulberg.
            </p>
          </div>
          <div className="flex flex-wrap gap-3" data-reveal>
            {profile.is_admin && (
              <Link to="/admin/passport" className="btn-ghost px-6 py-3 text-[.55rem]">
                ADMIN LEDGER
              </Link>
            )}
            <button onClick={() => signOut()} className="btn-ghost px-6 py-3 text-[.55rem]">
              CLOSE BOOK
            </button>
          </div>
        </div>

        <PassportBook profile={profile} stamps={bundle.stamps} animateNewIds={newStampIds} />

        <JourneyTrail steps={journey} />

        <div className="mt-16 grid lg:grid-cols-2 gap-10">
          <section>
            <p className="text-[.55rem] tracking-[.4em] text-bronze mb-4">EARN A SEAL</p>
            <h2 className="font-serif text-3xl text-cream mb-6">Ink today’s journey</h2>

            <form onSubmit={onVerify} className="bg-coal border border-cream/10 p-6 space-y-4 mb-6">
              <p className="text-sm text-cream/50">
                Ask your barista for a house seal code, then press it into your book.
              </p>
              <input
                name="code"
                className="field"
                placeholder="e.g. DRIP-GULBERG"
                required
              />
              <button
                type="submit"
                disabled={busy}
                className="btn-primary magnetic w-full py-3 text-[.58rem] font-medium"
              >
                {busy ? 'INKING…' : 'VERIFY VISIT'}
              </button>
              <p className="text-[.5rem] tracking-[.2em] text-cream/30">
                DEMO CODES · DRIP-GULBERG · DRIP-DHA · DRIP-ADDA
              </p>
            </form>

            <div className="space-y-3">
              <p className="text-[.55rem] tracking-[.35em] text-bronze mb-2">COMPLETE AN ORDER</p>
              {[
                { drink: 'Spanish Latte', pastry: 'Butter Croissant' },
                { drink: 'Matcha Latte' },
                { drink: 'Tiramisu Latte', pastry: 'Basque Cheesecake', ritual: true },
                { drink: 'Cortado Coffee', pastry: 'Hot Honey Croissant Sando' },
              ].map((o) => (
                <button
                  key={o.drink + (o.pastry || '')}
                  disabled={busy}
                  onClick={() => stampOrder(o.drink, o.pastry, o.ritual)}
                  className="w-full text-left border border-cream/10 hover:border-bronze/40 px-5 py-4 transition-colors"
                  data-hover
                >
                  <span className="font-serif text-xl text-cream">
                    {o.drink}
                    {o.pastry ? ` · ${o.pastry}` : ''}
                  </span>
                  <span className="block text-[.5rem] tracking-[.3em] text-bronze mt-1">
                    {o.ritual ? 'RITUAL COMPLETED' : 'ORDER COMPLETED'} · +1 SEAL
                  </span>
                </button>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-red-400/80">{error}</p>}
          </section>

          <section>
            <p className="text-[.55rem] tracking-[.4em] text-bronze mb-4">CORRIDORS</p>
            <h2 className="font-serif text-3xl text-cream mb-6">Milestone rewards</h2>
            <RewardTimeline
              rewards={bundle.rewards}
              unlocked={bundle.unlockedRewards}
              stampCount={bundle.stamps.length}
              highlightIds={newRewIds}
            />
          </section>
        </div>

        <section className="mt-20">
          <p className="text-[.55rem] tracking-[.4em] text-bronze mb-4">DISTINCTIONS</p>
          <h2 className="font-serif text-3xl text-cream mb-8">Achievements</h2>
          <AchievementGrid
            achievements={bundle.achievements}
            unlocked={bundle.unlockedAchievements}
            highlightIds={newAchIds}
          />
        </section>
      </div>
    </div>
  )
}
