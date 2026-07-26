import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import type { JourneyStep } from '../../lib/passportJourney'

type Props = {
  steps: JourneyStep[]
}

export function JourneyTrail({ steps }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const items = ref.current.querySelectorAll('.journey-step')
    gsap.fromTo(
      items,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.15,
      },
    )
  }, [steps])

  return (
    <section className="mt-20" data-reveal>
      <p className="text-[.55rem] tracking-[.4em] text-bronze mb-4">TRAVEL LOG</p>
      <h2 className="font-serif text-3xl md:text-4xl text-cream mb-3">Your crossing</h2>
      <p className="text-cream/50 max-w-xl mb-12 text-sm leading-relaxed">
        A quiet ledger of firsts, favourites, and streaks — read top to bottom like stamps in a
        passport, not points on a card.
      </p>

      <div ref={ref} className="max-w-xl mx-auto">
        {steps.map((step, i) => (
          <div key={step.id} className="journey-step">
            <article
              className={`relative border rounded-sm px-6 py-5 transition-colors ${
                step.unlocked
                  ? 'border-bronze/35 bg-gradient-to-br from-walnut/40 to-soot'
                  : 'border-cream/10 bg-coal/50'
              }`}
              data-hover
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-[.5rem] tracking-[.35em] ${
                      step.unlocked ? 'text-bronze' : 'text-cream/30'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')} · {step.title.toUpperCase()}
                  </p>
                  <p
                    className={`font-serif text-2xl md:text-3xl mt-2 leading-tight ${
                      step.unlocked ? 'text-cream' : 'text-cream/35'
                    }`}
                  >
                    {step.value}
                  </p>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${
                      step.unlocked ? 'text-cream/50' : 'text-cream/25'
                    }`}
                  >
                    {step.detail}
                  </p>
                </div>
                <span
                  className={`shrink-0 mt-1 w-2.5 h-2.5 rounded-full ${
                    step.unlocked ? 'bg-bronzelight shadow-[0_0_12px_rgba(217,179,130,.55)]' : 'bg-cream/15'
                  }`}
                />
              </div>
            </article>

            {i < steps.length - 1 && (
              <div className="flex flex-col items-center py-2 text-bronze/50" aria-hidden>
                <span className="w-px h-4 bg-gradient-to-b from-bronze/40 to-transparent" />
                <span className="text-[.7rem] leading-none my-1">↓</span>
                <span className="w-px h-4 bg-gradient-to-b from-transparent to-bronze/40" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
