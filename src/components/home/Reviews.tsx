import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { fetchReviews } from '../../lib/api'
import type { Review } from '../../lib/types'
import { REVIEWS } from '../../data/content'

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS)
  const [i, setI] = useState(0)

  useEffect(() => {
    fetchReviews().then(setReviews)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setI((v) => (v + 1) % reviews.length), 6500)
    return () => clearInterval(timer)
  }, [reviews.length])

  useEffect(() => {
    gsap.fromTo(
      ['#rev-quote', '#rev-author', '#rev-role', '#rev-stars'],
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' },
    )
  }, [i])

  const current = reviews[i] || REVIEWS[0]

  return (
    <section className="relative py-28 lg:py-40 bg-coal border-y border-cream/5 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
        <p className="flex items-center justify-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-10" data-reveal>
          <span className="eyebrow-line" /> 07 — KIND WORDS{' '}
          <span className="eyebrow-line" style={{ transform: 'scaleX(-1)' }} />
        </p>

        <div className="min-h-[16rem] flex flex-col items-center justify-center" data-reveal>
          <div className="flex gap-1 mb-8" id="rev-stars">
            {Array.from({ length: current.rating }).map((_, idx) => (
              <svg key={idx} className="star">
                <use href="#star" />
              </svg>
            ))}
          </div>
          <blockquote
            id="rev-quote"
            className="font-serif text-3xl md:text-[2.6rem] leading-[1.25] text-cream italic"
          >
            {current.quote}
          </blockquote>
          <p className="mt-8 text-[.65rem] tracking-[.4em] text-bronzelight" id="rev-author">
            {current.author}
          </p>
          <p className="mt-1 text-[.6rem] tracking-[.3em] text-cream/40" id="rev-role">
            {current.role}
          </p>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8" data-reveal>
          <button
            className="w-12 h-12 rounded-full border border-cream/20 flex items-center justify-center hover:border-bronze hover:text-bronzelight transition-colors"
            data-hover
            aria-label="Previous review"
            onClick={() => setI((v) => (v - 1 + reviews.length) % reviews.length)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <div className="flex gap-2">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                className={`rev-dot ${idx === i ? 'active' : ''}`}
                aria-label={`Review ${idx + 1}`}
                onClick={() => setI(idx)}
              />
            ))}
          </div>
          <button
            className="w-12 h-12 rounded-full border border-cream/20 flex items-center justify-center hover:border-bronze hover:text-bronzelight transition-colors"
            data-hover
            aria-label="Next review"
            onClick={() => setI((v) => (v + 1) % reviews.length)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
