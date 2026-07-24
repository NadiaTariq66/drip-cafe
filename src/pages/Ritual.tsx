import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_PULSE,
  RITUAL_MAP,
  RITUAL_MOODS,
  SITE,
} from '../data/content'
import { createRitual, fetchPulse, joinWaitlist, whatsappLink } from '../lib/api'
import type { CafePulse } from '../lib/types'
import { useReveal } from '../hooks/useReveal'

type Mode = 'ritual' | 'waitlist'

export function Ritual() {
  const [mode, setMode] = useState<Mode>('ritual')
  const [mood, setMood] = useState('slow')
  const [step, setStep] = useState(1)
  const [done, setDone] = useState<string | null>(null)
  const [waitDone, setWaitDone] = useState<string | null>(null)
  const [pulse, setPulse] = useState<CafePulse>(DEFAULT_PULSE)
  const [loading, setLoading] = useState(false)

  const pick = useMemo(() => RITUAL_MAP[mood], [mood])

  useReveal([mode, step, done, waitDone])
  useEffect(() => {
    document.title = 'Drip Ritual — DRIP Gulberg'
    fetchPulse().then(setPulse)
  }, [])

  async function submitRitual(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') || '').trim()
    const phone = String(fd.get('phone') || '').trim()
    const pickup_time = String(fd.get('pickup_time') || '')
    const notes = String(fd.get('notes') || '')
    if (!name || !phone) return

    setLoading(true)
    try {
      await createRitual({
        name,
        phone,
        mood,
        time_of_day: pickup_time || 'ASAP',
        drink: pick.drink,
        pastry: pick.pastry,
        pickup_time,
        notes,
      })
      setDone(
        `${pick.drink} + ${pick.pastry} queued for ${name}. Bar ticket auto-printed — ready in ~12 minutes.`,
      )
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  async function submitWaitlist(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') || '').trim()
    const phone = String(fd.get('phone') || '').trim()
    const party_size = Number(fd.get('party_size') || 2)
    if (!name || !phone) return

    setLoading(true)
    try {
      const entry = await joinWaitlist({ name, phone, party_size })
      setWaitDone(
        `You’re #${entry.position} on the Gulberg waitlist. ETA ~${entry.eta_minutes} min. We’ll ping when your table is ready.`,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-36 pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
          <span className="eyebrow-line" /> UNIQUE · DRIP RITUAL
        </p>
        <h1 className="font-serif text-5xl md:text-7xl text-cream max-w-3xl" data-split>
          Your usual, before you arrive
        </h1>
        <p className="mt-6 max-w-2xl text-cream/55 leading-relaxed" data-reveal>
          The feature that makes this site worth buying: mood-based order builder + live waitlist +
          kitchen automation. Guests pre-order; staff gets an auto ticket. No app download.
        </p>

        <div
          className="mt-10 inline-flex border border-cream/15 rounded-sm overflow-hidden"
          data-reveal
        >
          {(
            [
              ['ritual', 'BUILD RITUAL'],
              ['waitlist', 'JOIN WAITLIST'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                setMode(id)
                setDone(null)
                setWaitDone(null)
                setStep(1)
              }}
              className={`px-6 py-3 text-[.6rem] tracking-[.3em] transition-colors ${
                mode === id ? 'bg-bronze text-ink' : 'text-cream/50 hover:text-cream'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4 text-sm text-cream/45" data-reveal>
          <span className="relative flex h-2 w-2">
            <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-bronze" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-bronzelight" />
          </span>
          Live Gulberg · {pulse.live_note} · {pulse.busy_level}% busy · ~{pulse.avg_wait_minutes} min wait
        </div>

        {mode === 'ritual' && (
          <div className="mt-14 grid lg:grid-cols-2 gap-12">
            <div>
              <p className="text-[.55rem] tracking-[.4em] text-bronze mb-6">
                STEP {Math.min(step, 2)} OF 2
              </p>
              {step === 1 && (
                <div className="space-y-4" data-reveal>
                  <h2 className="font-serif text-3xl text-cream mb-6">How are you arriving?</h2>
                  {RITUAL_MOODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMood(m.id)}
                      className={`w-full text-left p-5 border transition-colors ${
                        mood === m.id
                          ? 'border-bronze bg-bronze/10'
                          : 'border-cream/10 hover:border-bronze/40'
                      }`}
                      data-hover
                    >
                      <p className="font-serif text-2xl text-cream">{m.label}</p>
                      <p className="text-sm text-cream/45 mt-1">{m.hint}</p>
                    </button>
                  ))}
                  <button
                    onClick={() => setStep(2)}
                    className="btn-primary magnetic mt-6 px-8 py-4 text-[.62rem] font-medium"
                  >
                    CONTINUE
                  </button>
                </div>
              )}

              {step >= 2 && !done && (
                <form onSubmit={submitRitual} className="space-y-6 bg-coal border border-cream/10 p-8" data-reveal>
                  <div className="border border-bronze/30 p-6 mb-2">
                    <p className="text-[.55rem] tracking-[.4em] text-bronze">YOUR RITUAL</p>
                    <p className="font-serif text-3xl text-cream mt-2">
                      {pick.drink}
                      <span className="text-bronzelight"> + </span>
                      {pick.pastry}
                    </p>
                    <p className="mt-3 text-cream/55 text-sm">{pick.blurb}</p>
                  </div>
                  <div>
                    <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">NAME</label>
                    <input name="name" className="field" required placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">PHONE</label>
                    <input name="phone" className="field" required placeholder="03XX XXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">
                      PICKUP TIME
                    </label>
                    <select name="pickup_time" className="field" defaultValue="In 20 min">
                      {['ASAP', 'In 15 min', 'In 20 min', 'In 30 min', 'In 45 min'].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">NOTES</label>
                    <input name="notes" className="field" placeholder="Less sweet / oat milk / extra hot" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-ghost px-6 py-4 text-[.6rem]"
                    >
                      BACK
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary magnetic px-8 py-4 text-[.6rem] font-medium"
                    >
                      {loading ? 'QUEUING…' : 'QUEUE MY RITUAL'}
                    </button>
                  </div>
                </form>
              )}

              {done && (
                <div className="bg-coal border border-bronze/30 p-10 text-center" data-reveal>
                  <p className="font-script text-4xl text-bronzelight">locked in</p>
                  <h3 className="font-serif text-3xl text-cream mt-4">Bar’s on it.</h3>
                  <p className="mt-4 text-cream/60 text-sm leading-relaxed">{done}</p>
                  <a
                    href={whatsappLink(
                      `Hi DRIP! I queued a Ritual: ${pick.drink} + ${pick.pastry}. See you soon at Gulberg.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary magnetic inline-block mt-8 px-8 py-4 text-[.6rem] font-medium"
                  >
                    SEND TO WHATSAPP
                  </a>
                  <div className="mt-6">
                    <Link to="/automation" className="link-lux text-[.6rem] tracking-[.3em] text-cream/50">
                      SEE IT ON PULSE DESK →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" data-reveal data-delay="0.15">
              <div className="zoom-img rounded-sm border border-cream/10 sticky top-32">
                <img
                  src="https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1200&auto=format&fit=crop"
                  alt="Spanish latte ritual"
                  className="w-full h-[70vh] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-[.55rem] tracking-[.4em] text-bronzelight">AUTO KITCHEN TICKET</p>
                  <p className="font-serif text-3xl text-cream mt-2">
                    {pick.drink}
                    <br />
                    <span className="text-bronzelight">{pick.pastry}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'waitlist' && (
          <div className="mt-14 max-w-xl" data-reveal>
            {!waitDone ? (
              <form onSubmit={submitWaitlist} className="bg-coal border border-cream/10 p-8 md:p-10 space-y-6">
                <h2 className="font-serif text-3xl text-cream">Join the live queue</h2>
                <p className="text-cream/50 text-sm">
                  Walk-ins hate standing. Guests join from their phone; hosts get a live list on Pulse
                  Desk.
                </p>
                <div>
                  <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">NAME</label>
                  <input name="name" className="field" required />
                </div>
                <div>
                  <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">PHONE</label>
                  <input name="phone" className="field" required />
                </div>
                <div>
                  <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">PARTY SIZE</label>
                  <select name="party_size" className="field" defaultValue="2">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary magnetic w-full py-4 text-[.62rem] font-medium"
                >
                  {loading ? 'JOINING…' : 'JOIN WAITLIST'}
                </button>
                <p className="text-center text-[.55rem] tracking-[.3em] text-cream/30">
                  OR CALL {SITE.phone}
                </p>
              </form>
            ) : (
              <div className="bg-coal border border-bronze/30 p-10 text-center">
                <p className="font-script text-4xl text-bronzelight">you’re in</p>
                <p className="mt-6 text-cream/60 leading-relaxed">{waitDone}</p>
                <Link
                  to="/automation"
                  className="btn-ghost magnetic inline-block mt-8 px-8 py-4 text-[.6rem]"
                >
                  HOST VIEW
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
