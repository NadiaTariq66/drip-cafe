import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SECRET_SUMMER_MENU, SECRET_UNLOCK_KEY } from '../data/secretMenu'
import { formatPrice } from '../data/content'
import { useReveal } from '../hooks/useReveal'

export function Secret() {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(SECRET_UNLOCK_KEY) === '1',
  )

  useEffect(() => {
    document.title = 'Secret Summer Menu — DRIP'
    setUnlocked(localStorage.getItem(SECRET_UNLOCK_KEY) === '1')
  }, [])

  useReveal([unlocked])

  if (!unlocked) {
    return (
      <div className="pt-40 pb-28 px-6 text-center max-w-lg mx-auto">
        <p className="text-[.62rem] tracking-[.5em] text-bronze mb-6">LOCKED</p>
        <h1 className="font-serif text-5xl text-cream">Nothing to see here</h1>
        <p className="mt-6 text-cream/50 leading-relaxed">
          Find five coffee beans hidden around the site. Click them. The summer door will open.
        </p>
        <Link to="/" className="btn-ghost magnetic inline-block mt-10 px-8 py-3 text-[.58rem]">
          BACK TO DRIP
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-36 pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
          <span className="eyebrow-line" /> YOU FOUND IT
        </p>
        <h1 className="font-serif text-5xl md:text-7xl text-cream" data-split>
          Secret Summer Menu
        </h1>
        <p className="mt-6 max-w-xl text-cream/55 leading-relaxed" data-reveal>
          Congratulations — five beans, one unlock. These pours aren’t on the public board. Tell your
          barista you came through the summer door.
        </p>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {SECRET_SUMMER_MENU.map((item, i) => (
            <article
              key={item.id}
              className="border border-bronze/25 bg-gradient-to-br from-walnut/50 to-coal p-8"
              data-reveal
              data-delay={String(i * 0.08)}
              data-hover
            >
              <p className="text-[.5rem] tracking-[.4em] text-bronze">{item.tag}</p>
              <h3 className="font-serif text-3xl text-cream mt-3">{item.name}</h3>
              <p className="mt-3 text-cream/55 text-sm leading-relaxed">{item.description}</p>
              <p className="mt-6 font-serif text-xl text-bronzelight">{formatPrice(item.price)}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
