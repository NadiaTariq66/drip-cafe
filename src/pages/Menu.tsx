import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMenu } from '../lib/api'
import { formatPrice, MENU } from '../data/content'
import type { MenuCategory, MenuItem } from '../lib/types'
import { useReveal } from '../hooks/useReveal'

const tabs: { id: MenuCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'coffee', label: 'COFFEE' },
  { id: 'signature', label: 'SIGNATURE' },
  { id: 'bakery', label: 'BAKERY' },
  { id: 'kitchen', label: 'KITCHEN' },
]

export function Menu() {
  const [items, setItems] = useState<MenuItem[]>(MENU)
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('all')

  useEffect(() => {
    document.title = 'Menu — DRIP Gulberg'
    fetchMenu().then(setItems)
  }, [])

  const filtered = useMemo(
    () => (tab === 'all' ? items : items.filter((i) => i.category === tab)),
    [items, tab],
  )

  useReveal([tab, filtered.length])

  return (
    <div className="pt-36 pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
          <span className="eyebrow-line" /> THE COLLECTION
        </p>
        <h1 className="font-serif text-6xl md:text-8xl text-cream" data-split>
          Menu
        </h1>
        <p className="mt-6 max-w-xl text-cream/55 leading-relaxed" data-reveal>
          Coffee, bakery and kitchen — from Spanish Latte to Hot Honey Croissant Sando. Rs 1,000–2,000
          per person, depending how hungry the table gets.
        </p>

        <div className="mt-12 flex flex-wrap gap-3" data-reveal>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-[.6rem] tracking-[.3em] border transition-colors ${
                tab === t.id
                  ? 'border-bronze text-bronzelight bg-bronze/10'
                  : 'border-cream/15 text-cream/50 hover:border-bronze/50'
              }`}
              data-hover
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <article
              key={item.id}
              className="lux-card group bg-soot border border-cream/10 rounded-sm overflow-hidden"
              data-reveal
              data-delay={String((i % 6) * 0.05)}
              data-hover
            >
              <div className="zoom-img h-64">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-7">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-[.55rem] tracking-[.4em] text-bronze">
                    {item.category.toUpperCase()}
                  </p>
                  {item.popular && (
                    <span className="text-[.5rem] tracking-[.3em] text-bronzelight border border-bronze/40 px-2 py-1">
                      POPULAR
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-2xl text-cream group-hover:text-bronzelight transition-colors">
                  {item.name}
                </h3>
                <p className="mt-3 text-sm text-cream/55 leading-relaxed">{item.description}</p>
                <p className="mt-6 font-serif text-xl text-bronzelight">{formatPrice(item.price)}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-20 text-center border-t border-cream/10 pt-14" data-reveal>
          <p className="font-script text-4xl text-bronzelight mb-4">can’t decide?</p>
          <p className="text-cream/55 mb-8">Let Drip Ritual build your usual in three taps.</p>
          <Link to="/ritual" className="btn-primary magnetic inline-block px-10 py-4 text-[.62rem] font-medium">
            BUILD YOUR RITUAL
          </Link>
        </div>
      </div>
    </div>
  )
}
