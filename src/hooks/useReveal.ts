import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]')
    const tweens = reveals.map((el) =>
      gsap.fromTo(
        el,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.15,
          ease: 'power3.out',
          delay: parseFloat(el.dataset.delay || '0'),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      ),
    )

    document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      if (el.dataset.splitDone) return
      const words = el.textContent?.trim().split(/\s+/) || []
      el.innerHTML = words
        .map((w) => `<span class="wmask"><span class="wword">${w}</span></span>`)
        .join(' ')
      el.dataset.splitDone = '1'
      gsap.to(el.querySelectorAll('.wword'), {
        y: 0,
        duration: 1.1,
        stagger: 0.045,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      })
    })

    ScrollTrigger.refresh()

    return () => {
      tweens.forEach((t) => t.kill())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
