import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { SITE } from '../../data/content'

type Props = { playIntro: boolean }

export function Hero({ playIntro }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!playIntro) return
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.to('.hero-letter', { y: 0, duration: 1.4, stagger: 0.09 })
      .to('.hero-fade', { opacity: 1, y: 0, duration: 1, stagger: 0.09 }, '-=.9')
      .fromTo('header', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, '-=1')
  }, [playIntro])

  useEffect(() => {
    const canvas = canvasRef.current
    const hero = sectionRef.current
    if (!canvas || !hero) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mouse = { x: -9999, y: -9999 }
    let W = 0
    let H = 0
    let beans: Array<{
      x: number
      y: number
      vx: number
      vy: number
      rot: number
      vr: number
      s: number
      a: number
    }> = []
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0

    function resize() {
      W = hero!.offsetWidth
      H = hero!.offsetHeight
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.min(26, Math.floor((W * H) / 55000))
      beans = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.22 - 0.08,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.004,
        s: 6 + Math.random() * 11,
        a: 0.12 + Math.random() * 0.22,
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const onMove = (e: MouseEvent) => {
      const r = canvas!.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      if (window.matchMedia('(pointer:fine)').matches) {
        const cx = e.clientX / window.innerWidth - 0.5
        const cy = e.clientY / window.innerHeight - 0.5
        gsap.to('#hero-bg', { x: cx * 22, y: cy * 14, duration: 1.2, ease: 'power2.out' })
        gsap.to('#hero-title-wrap', { x: cx * -26, y: cy * -14, duration: 1.2, ease: 'power2.out' })
      }
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    hero.addEventListener('mousemove', onMove)
    hero.addEventListener('mouseleave', onLeave)

    function draw() {
      ctx!.clearRect(0, 0, W, H)
      for (const b of beans) {
        const dx = b.x - mouse.x
        const dy = b.y - mouse.y
        const d = Math.hypot(dx, dy)
        if (d < 130 && d > 0) {
          const f = ((130 - d) / 130) * 0.9
          b.x += (dx / d) * f
          b.y += (dy / d) * f
        }
        b.x += b.vx
        b.y += b.vy
        b.rot += b.vr
        if (b.x < -30) b.x = W + 30
        if (b.x > W + 30) b.x = -30
        if (b.y < -30) b.y = H + 30
        if (b.y > H + 30) b.y = -30
        ctx!.save()
        ctx!.translate(b.x, b.y)
        ctx!.rotate(b.rot)
        ctx!.fillStyle = `rgba(111,78,55,${b.a})`
        ctx!.beginPath()
        ctx!.ellipse(0, 0, b.s, b.s * 0.62, 0, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.strokeStyle = `rgba(13,11,9,${b.a * 0.95})`
        ctx!.lineWidth = Math.max(1, b.s * 0.14)
        ctx!.beginPath()
        ctx!.moveTo(0, -b.s * 0.55)
        ctx!.quadraticCurveTo(b.s * 0.38, 0, 0, b.s * 0.55)
        ctx!.stroke()
        ctx!.restore()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      hero.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section ref={sectionRef} id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          id="hero-bg"
          src="https://images.deliveryhero.io/image/global-menu-service/FP_PK/vendor/gvi4/product/595c1fd6-995c-4765-b259-0662ea41c266.jpg?width=2000&height=1400"
          alt="DRIP Pistachio Kunafa French Toast"
          className="w-full h-full object-cover scale-[1.18] will-change-transform"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div className="hero-fade hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 items-center gap-4 rotate-90 origin-right">
        <span className="w-16 h-px bg-bronze/60" />
        <span className="text-[.6rem] tracking-[.55em] text-cream/50 whitespace-nowrap">
          GULBERG — LAHORE
        </span>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 pt-40 pb-32">
        <p className="hero-fade flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6">
          <span className="eyebrow-line" /> {SITE.est} — A HOUSE OF SLOW RITUALS
        </p>

        <div id="hero-title-wrap" className="will-change-transform">
          <h1
            className="font-serif leading-[.85] text-cream select-none"
            style={{ fontSize: 'clamp(5.5rem,19vw,17rem)' }}
          >
            {['D', 'R', 'I', 'P'].map((l, i) => (
              <span key={l} className="hero-letter-mask">
                <span className={`hero-letter ${i === 3 ? 'text-bronze' : ''}`}>{l}</span>
              </span>
            ))}
          </h1>
          <p className="hero-fade font-script text-bronzelight text-3xl md:text-5xl -mt-2 md:-mt-6 ml-2 md:ml-6 rotate-[-3deg]">
            brewed with patience
          </p>
        </div>

        <div className="mt-10 md:mt-14 md:flex items-end justify-between gap-10">
          <div className="max-w-md">
            <p className="hero-fade text-[.68rem] tracking-[.45em] text-cream/70 mb-5">
              COFFEE &nbsp;·&nbsp; KITCHEN &nbsp;·&nbsp; BAKERY
            </p>
            <p className="hero-fade text-cream/70 leading-relaxed text-base md:text-lg">
              Spanish latte, wood-fired bakery and a slow kitchen — gathered under one roof on Main
              Boulevard Gulberg. 4.5★ from {SITE.reviewCount} guests.
            </p>
            <div className="hero-fade mt-9 flex flex-wrap gap-4">
              <Link to="/ritual" className="btn-primary magnetic px-9 py-4 text-[.62rem] font-medium">
                BUILD YOUR RITUAL
              </Link>
              <Link to="/menu" className="btn-ghost magnetic px-9 py-4 text-[.62rem]">
                VIEW THE MENU
              </Link>
            </div>
          </div>
          <div className="hero-fade hidden md:flex flex-col items-center gap-4 mt-12 md:mt-0">
            <span className="text-[.55rem] tracking-[.45em] text-cream/50">SCROLL</span>
            <div className="scroll-line" />
          </div>
        </div>
      </div>
    </section>
  )
}
