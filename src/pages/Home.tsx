import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AboutTeaser } from '../components/home/AboutTeaser'
import { CommunityWall } from '../components/home/CommunityWall'
import { Hero } from '../components/home/Hero'
import { InstagramStrip } from '../components/home/InstagramStrip'
import { Marquee } from '../components/home/Marquee'
import { MenuHighlights } from '../components/home/MenuHighlights'
import { PulseBanner } from '../components/home/PulseBanner'
import { Reviews } from '../components/home/Reviews'
import { WeatherEngine } from '../components/home/WeatherEngine'
import { useReveal } from '../hooks/useReveal'
import { SITE } from '../data/content'

export function Home() {
  useReveal([])

  useEffect(() => {
    document.title = 'DRIP — Coffee · Kitchen · Bakery | Gulberg, Lahore'
  }, [])

  return (
    <>
      <Hero playIntro />
      <Marquee />
      <WeatherEngine />
      <PulseBanner />
      <AboutTeaser />
      <MenuHighlights />
      <CommunityWall />
      <Reviews />
      <InstagramStrip />

      <section className="relative py-28 bg-soot border-t border-bronze/15">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-12 items-center">
          <div data-reveal>
            <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6">
              <span className="eyebrow-line" /> VISIT
            </p>
            <h2 className="font-serif text-5xl md:text-6xl text-cream" data-split>
              Find your table
            </h2>
            <p className="mt-6 text-cream/55 leading-relaxed max-w-md">
              {SITE.address}
            </p>
            <p className="mt-4 text-cream/70">{SITE.hours.note} · {SITE.phone}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/reserve" className="btn-primary magnetic px-8 py-4 text-[.62rem] font-medium">
                RESERVE A TABLE
              </Link>
              <a
                href={SITE.maps}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost magnetic px-8 py-4 text-[.62rem]"
              >
                DIRECTIONS
              </a>
            </div>
          </div>
          <div className="zoom-img rounded-sm border border-cream/10 h-[50vh]" data-reveal data-delay="0.15">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop"
              alt="DRIP dining room"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  )
}
