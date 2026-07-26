import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SITE } from '../data/content'
import { useReveal } from '../hooks/useReveal'

export function About() {
  useReveal([])
  useEffect(() => {
    document.title = 'About — DRIP Gulberg'
  }, [])

  return (
    <div className="pt-36 pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
          <span className="eyebrow-line" /> OUR STORY
        </p>
        <h1 className="font-serif text-6xl md:text-8xl text-cream max-w-4xl" data-split>
          Coffee. Kitchen. Bakery.
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-cream/60 leading-relaxed" data-reveal>
          DRIP is Lahore’s slow house — three rituals under one roof across Gulberg, DHA Phase 4 and
          Adda Plot. We roast, bake and plate with patience, then leave you alone with the light.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-20 grid lg:grid-cols-2 gap-10">
        <div className="zoom-img rounded-sm border border-cream/10 h-[60vh]" data-reveal>
          <img
            src="https://images.deliveryhero.io/image/global-menu-service/FP_PK/vendor/gvi4/product/100894068/27fcb984-1f06-4a95-a69b-a953da90624f.jpg?width=1400&height=1400"
            alt="Coffee service"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center" data-reveal data-delay="0.15">
          <h2 className="font-serif text-4xl text-cream mb-6">What guests notice</h2>
          <ul className="space-y-5 text-cream/60 leading-relaxed">
            <li className="border-b border-cream/10 pb-5">
              <span className="text-bronzelight tracking-[.3em] text-[.6rem]">COFFEE</span>
              <p className="mt-2">
                Spanish Latte, Tiramisu Latte, Cortado, Spanish Matcha, Mocha — the same drinks on
                Foodpanda &amp; in-house.
              </p>
            </li>
            <li className="border-b border-cream/10 pb-5">
              <span className="text-bronzelight tracking-[.3em] text-[.6rem]">BAKERY</span>
              <p className="mt-2">Fresh bread as morning ritual. Croissants, cheesecake, new sandwich fills.</p>
            </li>
            <li className="border-b border-cream/10 pb-5">
              <span className="text-bronzelight tracking-[.3em] text-[.6rem]">KITCHEN</span>
              <p className="mt-2">All-day breakfast, crunchy wraps, and plates built for lingering.</p>
            </li>
            <li>
              <span className="text-bronzelight tracking-[.3em] text-[.6rem]">SERVICE</span>
              <p className="mt-2">
                Cooperative staff, free parking, cozy ambience — {SITE.rating}★ from {SITE.reviewCount}{' '}
                Google reviews.
              </p>
            </li>
          </ul>
          <Link to="/visit" className="link-lux mt-10 inline-block text-[.65rem] tracking-[.35em] text-bronzelight">
            FIND ALL LOCATIONS
          </Link>
        </div>
      </div>
    </div>
  )
}
