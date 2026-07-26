import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { BEANS_NEEDED, SECRET_UNLOCK_KEY } from '../data/secretMenu'

const POSITIONS = [
  { top: '22%', left: '4%' },
  { top: '58%', right: '3%' },
  { bottom: '18%', left: '8%' },
  { top: '40%', right: '6%' },
  { bottom: '30%', right: '12%' },
]

export function SecretBeans() {
  const [clicks, setClicks] = useState(0)
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(SECRET_UNLOCK_KEY) === '1',
  )
  const [toast, setToast] = useState(false)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(false), 5000)
    return () => clearTimeout(t)
  }, [toast])

  function onBean(i: number) {
    if (unlocked) return
    const el = document.querySelector(`[data-secret-bean="${i}"]`)
    if (el) {
      gsap.fromTo(el, { scale: 1.4, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.5, ease: 'elastic.out(1,.5)' })
    }
    const next = clicks + 1
    setClicks(next)
    if (next >= BEANS_NEEDED) {
      localStorage.setItem(SECRET_UNLOCK_KEY, '1')
      setUnlocked(true)
      setToast(true)
    }
  }

  return (
    <>
      {POSITIONS.map((pos, i) => (
        <button
          key={i}
          data-secret-bean={i}
          aria-label="Hidden coffee bean"
          onClick={() => onBean(i)}
          className="fixed z-[60] w-8 h-8 opacity-[0.14] hover:opacity-40 transition-opacity text-bronze"
          style={pos as CSSProperties}
        >
          <svg viewBox="0 0 40 26" className="w-full h-full">
            <use href="#bean" />
          </svg>
        </button>
      ))}

      {!unlocked && clicks > 0 && clicks < BEANS_NEEDED && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] text-[.5rem] tracking-[.35em] text-cream/40 bg-ink/80 border border-cream/10 px-4 py-2">
          {clicks}/{BEANS_NEEDED} BEANS
        </div>
      )}

      {toast && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/80 backdrop-blur-sm px-6">
          <div className="max-w-md w-full border border-bronze/40 bg-coal p-10 text-center">
            <p className="text-[.55rem] tracking-[.4em] text-bronze">CONGRATULATIONS</p>
            <h3 className="font-serif text-4xl text-cream mt-4">You unlocked</h3>
            <p className="font-script text-3xl text-bronzelight mt-2">Secret Summer Menu</p>
            <p className="mt-5 text-sm text-cream/50">
              Five beans. One quiet door. This menu doesn’t exist — until you find it.
            </p>
            <Link
              to="/secret"
              className="btn-primary magnetic inline-block mt-8 px-8 py-3 text-[.58rem] font-medium"
              onClick={() => setToast(false)}
            >
              OPEN SECRET MENU
            </Link>
            <button
              className="block mx-auto mt-5 text-[.55rem] tracking-[.3em] text-cream/40"
              onClick={() => setToast(false)}
            >
              LATER
            </button>
          </div>
        </div>
      )}
    </>
  )
}
