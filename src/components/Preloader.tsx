import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { getLenis } from '../hooks/useLenis'

type Props = {
  onDone: () => void
}

export function Preloader({ onDone }: Props) {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const lenis = getLenis()
    lenis?.stop()
    const plCount = { v: 0 }
    const countEl = document.getElementById('pl-count')

    const tl = gsap.timeline({
      onComplete() {
        setGone(true)
        lenis?.start()
        onDone()
      },
    })

    tl.to('.pl-letter', { y: 0, duration: 1, stagger: 0.09, ease: 'power4.out' }, 0.2)
      .to('.pl-tag', { opacity: 1, duration: 0.8 }, '-=.4')
      .to(
        plCount,
        {
          v: 100,
          duration: 1.9,
          ease: 'power2.inOut',
          onUpdate() {
            if (countEl) countEl.textContent = String(Math.round(plCount.v))
          },
        },
        0.3,
      )
      .to('.pl-letter', { y: '-115%', duration: 0.7, stagger: 0.06, ease: 'power3.in' }, '+=.25')
      .to('.pl-tag', { opacity: 0, duration: 0.4 }, '<')
      .to('#preloader', { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '-=.15')

    return () => {
      tl.kill()
    }
  }, [onDone])

  if (gone) return null

  return (
    <div
      id="preloader"
      className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center"
    >
      <div className="overflow-hidden">
        <div className="flex font-serif text-[18vw] md:text-[9rem] leading-none tracking-[.08em] text-cream">
          {['D', 'R', 'I', 'P'].map((letter, i) => (
            <span
              key={letter}
              className={`pl-letter inline-block translate-y-full ${i === 3 ? 'text-bronze' : ''}`}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
      <p className="pl-tag mt-2 text-[.65rem] tracking-[.5em] text-cream/50 opacity-0">
        COFFEE · KITCHEN · BAKERY
      </p>
      <div className="absolute bottom-10 right-10 font-serif text-4xl text-bronze/80">
        <span id="pl-count">0</span>
        <span className="text-lg text-cream/40">%</span>
      </div>
      <div className="absolute bottom-10 left-10 text-[.6rem] tracking-[.4em] text-cream/40">
        GULBERG — LAHORE
      </div>
    </div>
  )
}
