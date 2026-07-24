import { useEffect } from 'react'
import gsap from 'gsap'

export function useMagnetic() {
  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.magnetic'))
    const cleanups = nodes.map((btn) => {
      const move = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect()
        gsap.to(btn, {
          x: (e.clientX - r.left - r.width / 2) * 0.28,
          y: (e.clientY - r.top - r.height / 2) * 0.28,
          duration: 0.4,
          ease: 'power2.out',
        })
      }
      const leave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' })
      btn.addEventListener('mousemove', move)
      btn.addEventListener('mouseleave', leave)
      return () => {
        btn.removeEventListener('mousemove', move)
        btn.removeEventListener('mouseleave', leave)
      }
    })
    return () => cleanups.forEach((c) => c())
  })
}
