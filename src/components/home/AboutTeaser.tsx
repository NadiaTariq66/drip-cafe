import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { n: 9, label: 'YEARS IN LAHORE' },
  { n: 685, label: 'GOOGLE REVIEWS' },
  { n: 3, label: 'LOCATIONS' },
  { n: 45, label: 'MENU RITUALS' },
]

export function AboutTeaser() {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count)
      const o = { v: 0 }
      gsap.to(o, {
        v: end,
        duration: 2.2,
        ease: 'power2.out',
        onUpdate() {
          el.textContent = String(Math.round(o.v))
        },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      })
    })
  }, [])

  return (
    <section className="relative py-28 lg:py-40 bg-ink overflow-hidden">
      <svg className="float-bean w-16" style={{ top: '12%', right: '8%', ['--r' as string]: '24deg' }}>
        <use href="#bean" />
      </svg>
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="relative" data-reveal>
          <div className="zoom-img rounded-sm border border-cream/10">
            <img
              src="https://images.deliveryhero.io/image/global-menu-service/FP_PK/vendor/gvi4/product/100952941/4d9fc8f5-2f3c-4bc5-b654-5aae4bdf3346.jpg?width=1400&height=1400"
              alt="Barista pouring latte art"
              className="w-full h-[62vh] object-cover"
              loading="lazy"
            />
          </div>
          <div
            className="zoom-img absolute -bottom-10 -right-4 md:-right-10 w-44 md:w-64 border-4 border-ink rounded-sm shadow-2xl"
            data-reveal
            data-delay="0.2"
          >
            <img
              src="https://images.deliveryhero.io/image/fd-pk/Products/98616881.jpg?width=800&height=800"
              alt="Latte"
              className="w-full h-56 md:h-72 object-cover"
              loading="lazy"
            />
          </div>
          <p className="absolute -top-6 -left-2 font-script text-4xl text-bronze/80 rotate-[-6deg]">
            since 2016
          </p>
        </div>

        <div>
          <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
            <span className="eyebrow-line" /> 01 — OUR STORY
          </p>
          <h2 className="font-serif text-5xl md:text-6xl leading-[1.05] text-cream" data-split>
            Where Lahore learns to slow down
          </h2>
          <p className="mt-8 text-cream/65 leading-relaxed text-lg" data-reveal>
            DRIP is coffee, kitchen and bakery under one walnut roof — Gulberg, DHA Phase 4 and Adda
            Plot. Spanish lattes, fresh bread at dawn, and tables that don’t rush you out.
          </p>
          <p className="mt-5 text-cream/65 leading-relaxed" data-reveal>
            Cooperative staff, free parking, and the kind of ambience guests write home about —
            4.5 stars across hundreds of Google reviews.
          </p>
          <div className="mt-10 flex items-center gap-8" data-reveal>
            <Link to="/about" className="link-lux text-[.65rem] tracking-[.35em] text-bronzelight">
              READ OUR STORY
            </Link>
            <span className="w-10 h-px bg-bronze/50" />
            <Link to="/reserve" className="link-lux text-[.65rem] tracking-[.35em] text-cream/70">
              BOOK A TABLE
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-28 grid grid-cols-2 lg:grid-cols-4 gap-y-12 border-t border-cream/10 pt-14">
        {stats.map((s, i) => (
          <div key={s.label} data-reveal data-delay={String(i * 0.1)}>
            <p className="font-serif text-6xl text-bronzelight">
              <span data-count={s.n}>0</span>
            </p>
            <p className="mt-2 text-[.6rem] tracking-[.35em] text-cream/50">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
