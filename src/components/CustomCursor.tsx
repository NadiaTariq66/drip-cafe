import { useEffect } from 'react'
import gsap from 'gsap'

export function CustomCursor() {
  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return
    const dot = document.querySelector<HTMLElement>('.cursor-dot')
    const ring = document.querySelector<HTMLElement>('.cursor-ring')
    if (!dot || !ring) return

    gsap.set(ring, { xPercent: -50, yPercent: -50 })
    const rx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' })
    const ry = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })

    const onMove = (e: MouseEvent) => {
      dot.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`
      rx(e.clientX)
      ry(e.clientY)
    }
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest('a,button,[data-hover],select,input,textarea')) {
        ring.classList.add('is-active')
      }
    }
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element).closest('a,button,[data-hover],select,input,textarea')) {
        ring.classList.remove('is-active')
      }
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" />
      <div className="cursor-ring" />
    </>
  )
}
