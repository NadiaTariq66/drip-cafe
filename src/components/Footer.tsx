import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SITE } from '../data/content'
import { subscribeNewsletter } from '../lib/api'

export function Footer() {
  const [joined, setJoined] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = new FormData(form).get('email') as string
    if (!email) return
    await subscribeNewsletter(email)
    setJoined(true)
    form.reset()
  }

  return (
    <footer className="relative bg-ink border-t border-cream/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-10">
        <div className="grid md:grid-cols-4 gap-12 pb-16 border-b border-cream/10">
          <div className="md:col-span-2">
            <p className="font-serif text-4xl text-cream">DRIP</p>
            <p className="mt-1 text-[.55rem] tracking-[.45em] text-bronze">
              COFFEE · KITCHEN · BAKERY
            </p>
            <p className="mt-6 text-cream/50 text-sm leading-relaxed max-w-sm">
              A house of slow rituals in Gulberg, Lahore. Roasted, baked and braised — never
              hurried. {SITE.instagramHandle} · 18.4K+ on Instagram.
            </p>
            <form onSubmit={onSubmit} className="mt-8 flex max-w-sm">
              <input
                type="email"
                name="email"
                placeholder={joined ? 'You are on the list.' : 'Your email for the Sunday letter'}
                className="field !py-3 text-sm"
                required
              />
              <button className="btn-primary shrink-0 px-6 text-[.58rem] font-medium ml-4" data-hover>
                {joined ? 'WELCOME' : 'JOIN'}
              </button>
            </form>
          </div>
          <div>
            <p className="text-[.55rem] tracking-[.4em] text-bronze mb-6">EXPLORE</p>
            <ul className="space-y-3 text-sm text-cream/55">
              <li>
                <Link to="/about" className="link-lux" data-hover>
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/menu" className="link-lux" data-hover>
                  Full Menu
                </Link>
              </li>
              <li>
                <Link to="/ritual" className="link-lux" data-hover>
                  Build a Ritual
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="link-lux" data-hover>
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/automation" className="link-lux" data-hover>
                  Pulse Desk
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[.55rem] tracking-[.4em] text-bronze mb-6">FOLLOW</p>
            <ul className="space-y-3 text-sm text-cream/55">
              <li>
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="link-lux"
                  data-hover
                >
                  Instagram {SITE.instagramHandle}
                </a>
              </li>
              <li>
                <a href={`tel:${SITE.phoneTel}`} className="link-lux" data-hover>
                  Call {SITE.phone}
                </a>
              </li>
            </ul>
            <p className="text-[.55rem] tracking-[.4em] text-bronze mt-10 mb-4">CONTACT</p>
            <p className="text-sm text-cream/55">
              {SITE.email}
              <br />
              {SITE.phone}
            </p>
          </div>
        </div>

        <div className="py-10 text-center select-none">
          <span
            className="stroke-text font-serif leading-none block"
            style={{ fontSize: 'clamp(6rem,20vw,19rem)' }}
          >
            DRIP
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-cream/10 text-[.58rem] tracking-[.3em] text-cream/35">
          <p>© {new Date().getFullYear()} DRIP COFFEE BAKERY KITCHEN — GULBERG, LAHORE</p>
          <p>CRAFTED SLOWLY, LIKE EVERYTHING ELSE HERE</p>
        </div>
      </div>
    </footer>
  )
}
