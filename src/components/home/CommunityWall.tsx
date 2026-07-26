import { useEffect, useState } from 'react'
import {
  fetchCommunityEvents,
  relativeTime,
  subscribeCommunity,
  type CommunityEvent,
  isSupabaseConfigured,
} from '../../lib/communityWall'

const KIND_ICON: Record<CommunityEvent['kind'], string> = {
  order: '☕',
  passport: '❖',
  review: '★',
  visit: '◎',
  ritual: '✦',
}

export function CommunityWall() {
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [, tick] = useState(0)

  useEffect(() => {
    fetchCommunityEvents().then(setEvents)
    const unsub = subscribeCommunity(setEvents)
    const t = window.setInterval(() => tick((n) => n + 1), 5000)
    return () => {
      unsub()
      clearInterval(t)
    }
  }, [])

  return (
    <section className="relative py-28 bg-ink border-y border-cream/5">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="md:flex items-end justify-between gap-8 mb-12">
          <div>
            <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
              <span className="relative flex h-2 w-2">
                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-bronze" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-bronzelight" />
              </span>
              LIVE COMMUNITY WALL
            </p>
            <h2 className="font-serif text-5xl md:text-6xl text-cream" data-split>
              Right now at DRIP
            </h2>
            <p className="mt-4 text-cream/50 max-w-md" data-reveal>
              Not testimonials — a living feed of orders, seals, and kind words. Powered by Supabase
              realtime when connected.
            </p>
          </div>
          <p className="text-[.55rem] tracking-[.3em] text-cream/35" data-reveal>
            {isSupabaseConfigured ? 'SUPABASE LIVE' : 'DEMO PULSE'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.slice(0, 9).map((e, i) => (
            <article
              key={e.id}
              className="border border-cream/10 bg-coal/80 p-6 hover:border-bronze/35 transition-colors"
              data-reveal
              data-delay={String((i % 6) * 0.05)}
              data-hover
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xl text-bronzelight">{KIND_ICON[e.kind]}</span>
                <span className="text-[.5rem] tracking-[.25em] text-cream/35">
                  {relativeTime(e.created_at)}
                </span>
              </div>
              <p className="mt-4 text-[.55rem] tracking-[.3em] text-bronze uppercase">{e.title}</p>
              <p className="mt-2 font-serif text-2xl text-cream leading-snug">{e.detail}</p>
              {e.kind === 'order' && (
                <p className="mt-4 text-bronzelight/80 text-sm tracking-widest">❤</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
