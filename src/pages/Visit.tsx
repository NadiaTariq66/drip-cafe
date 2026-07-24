import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SITE } from '../data/content'
import { useReveal } from '../hooks/useReveal'

export function Visit() {
  useReveal([])
  useEffect(() => {
    document.title = 'Visit — DRIP Gulberg'
  }, [])

  return (
    <div className="pt-36 pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
          <span className="eyebrow-line" /> VISIT US
        </p>
        <h1 className="font-serif text-6xl md:text-8xl text-cream mb-16" data-split>
          Three doors in Lahore
        </h1>

        <div className="grid lg:grid-cols-5 gap-6">
          <div
            className="lux-card lg:col-span-3 bg-soot border border-cream/10 rounded-sm overflow-hidden"
            data-reveal
            data-hover
          >
            <div className="zoom-img h-72 md:h-80 relative">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop"
                alt="DRIP Gulberg"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-5 left-5 bg-ink/70 backdrop-blur px-4 py-2 text-[.55rem] tracking-[.4em] text-bronzelight border border-bronze/30">
                FLAGSHIP
              </span>
            </div>
            <div className="p-8 md:p-10 grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-serif text-3xl text-cream">Gulberg</h3>
                <p className="mt-3 text-cream/55 leading-relaxed text-sm">{SITE.address}</p>
                <a
                  href={SITE.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="link-lux inline-block mt-5 text-[.62rem] tracking-[.35em] text-bronzelight"
                >
                  GET DIRECTIONS
                </a>
              </div>
              <div className="text-sm">
                <p className="text-[.55rem] tracking-[.4em] text-bronze mb-4">HOURS</p>
                <div className="flex justify-between py-2 border-b border-cream/10 text-cream/60">
                  <span>Daily</span>
                  <span>8:00 — 1:00</span>
                </div>
                <p className="mt-5 text-cream/60">
                  {SITE.phone}
                  <br />
                  {SITE.email}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={`tel:${SITE.phoneTel}`} className="btn-ghost px-5 py-3 text-[.55rem]">
                    CALL
                  </a>
                  <Link to="/reserve" className="btn-primary px-5 py-3 text-[.55rem] font-medium">
                    RESERVE
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            {SITE.locations
              .filter((l) => !l.flagship)
              .map((loc, i) => (
                <div
                  key={loc.name}
                  className="lux-card flex-1 bg-gradient-to-br from-walnut/60 to-soot border border-bronze/20 rounded-sm p-8 md:p-10"
                  data-reveal
                  data-delay={String(0.15 * (i + 1))}
                  data-hover
                >
                  <p className="text-[.55rem] tracking-[.4em] text-bronze mb-4">ALSO OPEN</p>
                  <h3 className="font-serif text-3xl text-cream">{loc.name}</h3>
                  <p className="mt-3 text-cream/55 text-sm leading-relaxed">{loc.address}</p>
                  <p className="mt-4 text-[.6rem] tracking-[.3em] text-cream/40">{loc.hours}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
