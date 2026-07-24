import { useEffect, useState, type FormEvent } from 'react'
import gsap from 'gsap'
import { SITE } from '../data/content'
import { createReservation, whatsappLink } from '../lib/api'
import { useReveal } from '../hooks/useReveal'

export function Reserve() {
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useReveal([])
  useEffect(() => {
    document.title = 'Reserve — DRIP Gulberg'
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') || '').trim()
    const phone = String(fd.get('phone') || '').trim()
    const date = String(fd.get('date') || '')
    const time = String(fd.get('time') || '')
    const guests = Number(fd.get('guests') || 0)
    const occasion = String(fd.get('occasion') || '')

    if (!name || !phone || !date || !time || !guests) {
      setError(true)
      gsap.fromTo('#res-form', { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1,.3)' })
      return
    }

    setError(false)
    setLoading(true)
    try {
      const res = await createReservation({
        name,
        phone,
        date,
        time,
        guests,
        occasion,
        location: 'Gulberg',
      })
      const nice = new Date(date + 'T00:00').toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
      const msg = res.auto_confirmed
        ? `${name} — ${guests} guests · ${nice} at ${time}. Auto-confirmed. We’ll keep the light on.`
        : `${name} — ${guests} guests · ${nice} at ${time}. Larger party — our host will confirm shortly.`
      setSuccess(msg)
      gsap.to('.check-draw', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out', stagger: 0.25 })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="pt-36 pb-28 relative overflow-hidden">
      <svg className="float-bean w-20" style={{ top: '8%', left: '4%', ['--r' as string]: '12deg', opacity: 0.2 }}>
        <use href="#bean" />
      </svg>

      <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
            <span className="eyebrow-line" /> RESERVATION
          </p>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] text-cream" data-split>
            Save your seat by the fire
          </h1>
          <p className="mt-8 text-cream/55 leading-relaxed max-w-md" data-reveal>
            Tables of 4 or fewer auto-confirm instantly. Larger parties get a host callback. Held for
            fifteen minutes past the hour.
          </p>
          <div className="mt-12 space-y-6" data-reveal>
            <div className="flex items-center gap-5">
              <span className="w-12 h-12 rounded-full border border-bronze/30 flex items-center justify-center text-bronzelight text-[.6rem] tracking-widest">
                TEL
              </span>
              <div>
                <p className="text-[.55rem] tracking-[.4em] text-bronze">CALL</p>
                <p className="text-cream/70 mt-1">{SITE.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <span className="w-12 h-12 rounded-full border border-bronze/30 flex items-center justify-center text-bronzelight text-[.6rem] tracking-widest">
                MAP
              </span>
              <div>
                <p className="text-[.55rem] tracking-[.4em] text-bronze">FIND</p>
                <p className="text-cream/70 mt-1">Main Boulevard Gulberg</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative" data-reveal>
          {!success ? (
            <form
              id="res-form"
              onSubmit={onSubmit}
              className="bg-coal border border-cream/10 rounded-sm p-8 md:p-12 space-y-8"
            >
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">FULL NAME</label>
                  <input name="name" className="field" placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">PHONE</label>
                  <input name="phone" type="tel" className="field" placeholder="03XX XXXXXXX" required />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-8">
                <div>
                  <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">DATE</label>
                  <input name="date" type="date" min={minDate} className="field" required />
                </div>
                <div>
                  <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">TIME</label>
                  <select name="time" className="field" required defaultValue="">
                    <option value="" disabled>
                      Select
                    </option>
                    {['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM', '10:00 PM', '11:00 PM'].map(
                      (t) => (
                        <option key={t}>{t}</option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">GUESTS</label>
                  <select name="guests" className="field" required defaultValue="">
                    <option value="" disabled>
                      Select
                    </option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} Guest{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">
                  OCCASION <span className="text-cream/30">(OPTIONAL)</span>
                </label>
                <textarea
                  name="occasion"
                  rows={2}
                  className="field resize-none"
                  placeholder="Anniversary, quiet corner, window seat..."
                />
              </div>
              {error && (
                <p className="text-sm text-red-400/80 tracking-wide">
                  Please complete the required fields.
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary magnetic w-full py-5 text-[.65rem] font-medium"
                data-hover
              >
                {loading ? 'CONFIRMING…' : 'CONFIRM RESERVATION'}
              </button>
              <p className="text-center text-[.55rem] tracking-[.3em] text-cream/30">
                AUTO-CONFIRM FOR ≤4 · HELD 15 MINUTES
              </p>
            </form>
          ) : (
            <div className="bg-coal border border-bronze/30 rounded-sm p-10 flex flex-col items-center justify-center text-center min-h-[28rem]">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <circle cx="36" cy="36" r="33" stroke="#b78a52" strokeWidth="1.5" className="check-draw" />
                <path
                  d="M23 37l9 9 17-18"
                  stroke="#d9b382"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="check-draw"
                />
              </svg>
              <h3 className="font-serif text-4xl text-cream mt-8">Consider it done.</h3>
              <p className="font-script text-3xl text-bronzelight mt-2">we will keep the light on</p>
              <p className="mt-6 text-cream/60 text-sm leading-relaxed max-w-sm">{success}</p>
              <a
                href={whatsappLink(`Hi DRIP, I just reserved a table. ${success}`)}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost magnetic mt-8 px-8 py-4 text-[.6rem]"
              >
                CONFIRM ON WHATSAPP
              </a>
              <button
                className="link-lux mt-6 text-[.6rem] tracking-[.3em] text-cream/50"
                onClick={() => {
                  setSuccess(null)
                  gsap.set('.check-draw', { strokeDashoffset: 120 })
                }}
              >
                MAKE ANOTHER
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
