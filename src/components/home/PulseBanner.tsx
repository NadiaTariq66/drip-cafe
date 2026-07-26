import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPulse } from '../../lib/api'
import type { CafePulse } from '../../lib/types'
import { DEFAULT_PULSE } from '../../data/content'

export function PulseBanner() {
  const [pulse, setPulse] = useState<CafePulse>(DEFAULT_PULSE)

  useEffect(() => {
    fetchPulse().then(setPulse)
  }, [])

  return (
    <section className="relative py-16 bg-soot border-y border-bronze/20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
        <div data-reveal>
          <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-bronze opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-bronzelight" />
            </span>
            LIVE · DRIP PULSE
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight">
            Know before you go.
            <span className="block text-bronzelight italic">Skip the queue.</span>
          </h2>
          <p className="mt-5 text-cream/55 max-w-lg leading-relaxed">
            Our unique feature: live busy meter, digital waitlist, and one-tap Ritual pre-orders that
            auto-ticket the bar — so your Spanish Latte is ready when you walk in.
          </p>
        </div>

        <div
          className="bg-coal border border-cream/10 rounded-sm p-8"
          data-reveal
          data-delay="0.15"
        >
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[.55rem] tracking-[.4em] text-bronze">GULBERG RIGHT NOW</p>
              <p className="font-serif text-3xl text-cream mt-2">{pulse.live_note}</p>
            </div>
            <p className="font-serif text-5xl text-bronzelight">{pulse.busy_level}%</p>
          </div>
          <div className="h-1.5 bg-cream/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-bronze to-bronzelight transition-all duration-700"
              style={{ width: `${pulse.busy_level}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-cream/45">
            Avg wait ~{pulse.avg_wait_minutes} min · People typically spend 10 min to 1.5 hr
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/personality"
              className="btn-primary magnetic px-6 py-3 text-[.58rem] font-medium"
            >
              COFFEE PERSONALITY
            </Link>
            <Link to="/table/G12" className="btn-ghost magnetic px-6 py-3 text-[.58rem]">
              TRY TABLE QR
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
