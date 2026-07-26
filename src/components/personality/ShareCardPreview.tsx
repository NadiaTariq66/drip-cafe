import type { RefObject } from 'react'
import type { CoffeePersonality } from '../../data/coffeePersonality'
import { SITE } from '../../data/content'

type Props = {
  personality: CoffeePersonality
  cardRef?: RefObject<HTMLDivElement | null>
}

export function ShareCardPreview({ personality, cardRef }: Props) {
  return (
    <div
      ref={cardRef}
      className="personality-card relative mx-auto w-full max-w-[340px] aspect-[9/16] overflow-hidden rounded-sm border border-bronze/40 shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)]"
      data-hover
    >
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-[#1a1410] to-walnut" />
      <div className="absolute inset-[10px] border border-bronze/25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-bronze/20 blur-3xl pointer-events-none" />

      <div className="relative h-full flex flex-col items-center text-center px-7 pt-10 pb-8">
        <p className="text-[.5rem] tracking-[.4em] text-bronze">DRIP · COFFEE PERSONALITY</p>
        <p className="mt-2 text-[.45rem] tracking-[.35em] text-cream/40">GULBERG · LAHORE</p>

        <p className="mt-12 font-serif italic text-cream/50 text-lg">You are</p>
        <p className="mt-3 text-5xl leading-none">{personality.emoji}</p>
        <h3 className="mt-5 font-serif text-[1.85rem] leading-[1.1] text-cream px-1">
          {personality.title}
        </h3>
        <p className="mt-3 font-script text-2xl text-bronzelight">{personality.tagline}</p>

        <span className="mt-6 w-16 h-px bg-bronze/40" />

        <p className="mt-6 text-[.72rem] text-cream/60 leading-relaxed">{personality.blurb}</p>

        <div className="mt-auto w-full pt-8">
          <p className="text-[.45rem] tracking-[.35em] text-bronze mb-3">YOUR RITUAL TRAITS</p>
          <ul className="space-y-1.5">
            {personality.traits.map((t) => (
              <li key={t} className="font-serif text-sm text-cream/80">
                ◆ {t}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[.45rem] tracking-[.3em] text-bronze/90">FIND YOUR POUR AT DRIP</p>
          <p className="mt-2 text-[.4rem] tracking-[.25em] text-cream/35">
            {SITE.instagramHandle}
          </p>
        </div>
      </div>
    </div>
  )
}
