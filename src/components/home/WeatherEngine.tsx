import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { detectWeather, type WeatherReading } from '../../lib/weatherEngine'

export function WeatherEngine() {
  const [weather, setWeather] = useState<WeatherReading | null>(null)

  useEffect(() => {
    detectWeather().then((w) => {
      setWeather(w)
      gsap.fromTo(
        '.weather-panel',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
      )
    })
  }, [])

  if (!weather) {
    return (
      <section className="relative py-20 bg-coal border-y border-cream/5">
        <p className="text-center text-[.6rem] tracking-[.4em] text-cream/30">READING THE SKY…</p>
      </section>
    )
  }

  return (
    <section
      className={`weather-panel relative py-24 md:py-28 overflow-hidden bg-gradient-to-br ${weather.gradient} border-y border-cream/5`}
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 70% 30%, ${weather.accent}33, transparent 50%)`,
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div>
          <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] mb-6" style={{ color: weather.accent }}>
            <span className="eyebrow-line" style={{ background: `linear-gradient(90deg, ${weather.accent}, transparent)` }} />
            COFFEE WEATHER ENGINE
          </p>
          <div className="flex items-end gap-5 flex-wrap">
            <span className="text-6xl md:text-7xl leading-none">{weather.emoji}</span>
            <div>
              <p className="font-serif text-5xl md:text-6xl text-cream leading-none">
                {weather.mood === 'heat' && weather.tempC != null
                  ? `${Math.round(weather.tempC)}°`
                  : weather.label}
              </p>
              <p className="mt-2 text-[.65rem] tracking-[.35em] text-cream/45 uppercase">
                {weather.condition}
              </p>
            </div>
          </div>
          <p className="mt-8 text-cream/55 max-w-md leading-relaxed">
            The site reads the sky over Lahore (or your location) and pours a recommendation that
            matches the hour — rain, heat, winter, or night.
          </p>
        </div>

        <div
          className="border rounded-sm p-8 md:p-10 bg-ink/40 backdrop-blur-sm"
          style={{ borderColor: `${weather.accent}55` }}
        >
          <p className="text-[.55rem] tracking-[.4em]" style={{ color: weather.accent }}>
            RECOMMEND
          </p>
          <h3 className="font-serif text-4xl md:text-5xl text-cream mt-3">
            {weather.recommendation.drink}
          </h3>
          <p className="mt-4 text-cream/60 leading-relaxed">{weather.recommendation.blurb}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/ritual" className="btn-primary magnetic px-7 py-3 text-[.58rem] font-medium">
              ORDER THIS RITUAL
            </Link>
            <Link to="/concierge" className="btn-ghost magnetic px-7 py-3 text-[.58rem]">
              ASK CONCIERGE
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
