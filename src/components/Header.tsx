import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { getLenis } from '../hooks/useLenis'
import { SITE } from '../data/content'

const links = [
  { to: '/menu', label: 'MENU' },
  { to: '/personality', label: 'PERSONALITY' },
  { to: '/concierge', label: 'CONCIERGE' },
  { to: '/passport', label: 'PASSPORT' },
  { to: '/journal', label: 'JOURNAL' },
  { to: '/visit', label: 'VISIT' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    getLenis()?.start()
  }, [location.pathname])

  useEffect(() => {
    let lastY = 0
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      setHidden(y > 500 && y > lastY + 5)
      if (y < lastY - 5 || y < 200) setHidden(false)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      getLenis()?.stop()
      gsap.fromTo(
        '.mm-item',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'power3.out', delay: 0.15 },
      )
    } else {
      getLenis()?.start()
    }
  }, [menuOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[80] transition-transform duration-500 ${
          hidden ? '-translate-y-[110%]' : 'translate-y-0'
        }`}
      >
        <div className="hidden md:flex justify-between items-center px-10 py-2 text-[.6rem] tracking-[.35em] text-cream/50 border-b border-cream/5">
          <span>{SITE.shortAddress.toUpperCase()}</span>
          <span>OPEN DAILY · CLOSES 1 AM · 4.5★ ({SITE.reviewCount})</span>
        </div>
        <nav
          className={`flex items-center justify-between px-6 md:px-10 transition-all duration-500 ${
            scrolled
              ? 'bg-ink/85 backdrop-blur-md border-b border-cream/10 py-4'
              : 'py-5'
          }`}
        >
          <Link to="/" className="flex items-baseline gap-3 group" data-hover>
            <span className="font-serif text-3xl tracking-[.12em] text-cream group-hover:text-bronzelight transition-colors duration-500">
              DRIP
            </span>
            <span className="hidden sm:inline text-[.55rem] tracking-[.4em] text-bronze/80">
              {SITE.est}
            </span>
          </Link>

          <ul className="hidden lg:flex items-center gap-8 text-[.68rem] tracking-[.28em] text-cream/70">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) => `link-lux ${isActive ? 'active' : ''}`}
                  data-hover
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <Link
              to="/reserve"
              className="btn-primary magnetic hidden sm:inline-block px-7 py-3 text-[.62rem] font-medium"
              data-hover
            >
              RESERVE
            </Link>
            <button
              className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-[7px]"
              data-hover
              aria-label="Menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span
                className={`block w-7 h-px bg-cream transition-all duration-500 ${
                  menuOpen ? 'translate-y-[4px] rotate-45' : ''
                }`}
              />
              <span
                className={`block w-7 h-px bg-cream transition-all duration-500 ${
                  menuOpen ? '-translate-y-[4px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-[85] bg-coal/98 backdrop-blur-xl flex flex-col justify-center px-10 transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] ${
          menuOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <p className="text-[.6rem] tracking-[.45em] text-bronze mb-8 mm-item">MENU</p>
        <ul className="space-y-4">
          {[
            { to: '/about', n: '01', label: 'About' },
            { to: '/menu', n: '02', label: 'Menu' },
            { to: '/personality', n: '03', label: 'Personality' },
            { to: '/concierge', n: '04', label: 'Concierge' },
            { to: '/passport', n: '05', label: 'Passport' },
            { to: '/journal', n: '06', label: 'Journal' },
            { to: '/ritual', n: '07', label: 'Ritual' },
            { to: '/visit', n: '08', label: 'Visit' },
            { to: '/tables', n: '09', label: 'Tables' },
            { to: '/reserve', n: '10', label: 'Reserve' },
            { to: '/automation', n: '11', label: 'Pulse Desk' },
          ].map((item) => (
            <li key={item.to} className="overflow-hidden">
              <Link
                to={item.to}
                className="mm-item font-serif text-5xl text-cream hover:text-bronzelight transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-bronze text-lg align-top mr-4 font-sans tracking-widest">
                  {item.n}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mm-item absolute bottom-10 left-10 text-[.6rem] tracking-[.35em] text-cream/40">
          GULBERG — LAHORE · CLOSES 1 AM
        </p>
      </div>
    </>
  )
}
