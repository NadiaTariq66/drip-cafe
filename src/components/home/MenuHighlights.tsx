import { Link } from 'react-router-dom'
import { formatPrice, MENU } from '../../data/content'

export function MenuHighlights() {
  const items = MENU.filter((m) => m.popular).slice(0, 4)

  return (
    <section className="relative py-28 lg:py-40 bg-coal">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="md:flex items-end justify-between gap-10 mb-16">
          <div>
            <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
              <span className="eyebrow-line" /> 02 — MENU HIGHLIGHTS
            </p>
            <h2 className="font-serif text-5xl md:text-7xl leading-[1.02] text-cream" data-split>
              What Gulberg orders
            </h2>
          </div>
          <p className="max-w-sm text-cream/55 leading-relaxed mt-6 md:mt-0" data-reveal>
            Spanish Latte, Cortado, Tiramisu Latte, crunchy wraps and morning pastry — the hits
            guests keep coming back for.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <article
              key={item.id}
              className={`lux-card group bg-soot border border-cream/10 rounded-sm ${
                i % 2 === 1 ? 'lg:translate-y-10' : ''
              }`}
              data-reveal
              data-delay={String(i * 0.1)}
              data-hover
            >
              <div className="zoom-img h-72">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-7">
                <p className="text-[.55rem] tracking-[.4em] text-bronze mb-3">
                  {item.tag || item.category.toUpperCase()}
                </p>
                <h3 className="font-serif text-2xl text-cream group-hover:text-bronzelight transition-colors duration-500">
                  {item.name}
                </h3>
                <p className="mt-3 text-sm text-cream/55 leading-relaxed">{item.description}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-serif text-xl text-bronzelight">{formatPrice(item.price)}</span>
                  <span className="w-8 h-px bg-bronze/40 group-hover:w-14 group-hover:bg-bronze transition-all duration-500" />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 text-center" data-reveal>
          <Link to="/menu" className="btn-ghost magnetic inline-block px-10 py-4 text-[.62rem]">
            VIEW FULL MENU
          </Link>
        </div>
      </div>
    </section>
  )
}
