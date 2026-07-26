import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { STAMP_SLOTS } from '../../data/passportDefaults'
import type { PassportProfile, PassportStamp } from '../../lib/passportTypes'
import { StampSeal } from './StampSeal'

type Props = {
  profile: PassportProfile
  stamps: PassportStamp[]
  animateNewIds?: string[]
}

export function PassportBook({ profile, stamps, animateNewIds = [] }: Props) {
  const bookRef = useRef<HTMLDivElement>(null)
  const slots = Array.from({ length: STAMP_SLOTS }, (_, i) => stamps[i] || null)

  useEffect(() => {
    if (!bookRef.current) return
    gsap.fromTo(
      bookRef.current,
      { rotateY: -12, opacity: 0, y: 30 },
      { rotateY: 0, opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' },
    )
  }, [])

  useEffect(() => {
    if (!animateNewIds.length) return
    const nodes = animateNewIds
      .map((id) => {
        const idx = stamps.findIndex((s) => s.id === id)
        if (idx < 0) return null
        return bookRef.current?.querySelector(`[data-stamp-index="${idx}"] .stamp-seal`)
      })
      .filter(Boolean) as Element[]

    if (!nodes.length) return

    const tl = gsap.timeline()
    nodes.forEach((node) => {
      tl.fromTo(
        node,
        { scale: 1.6, opacity: 0, filter: 'blur(4px)', rotate: -25 },
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          rotate: 0,
          duration: 0.85,
          ease: 'elastic.out(1, 0.55)',
        },
        '-=0.35',
      )
      tl.fromTo(
        node,
        { filter: 'brightness(1.8)' },
        { filter: 'brightness(1)', duration: 0.6, ease: 'power2.out' },
        '-=0.4',
      )
    })
    return () => {
      tl.kill()
    }
  }, [animateNewIds, stamps])

  return (
    <div className="passport-stage perspective-[1600px]" data-reveal>
      <div
        ref={bookRef}
        className="passport-book relative grid md:grid-cols-2 gap-0 rounded-sm overflow-hidden border border-bronze/30 shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative bg-gradient-to-br from-[#1c1410] via-[#2a1c14] to-[#120e0b] p-8 md:p-10 border-r border-bronze/20 min-h-[28rem]">
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none passport-grain" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-bronze/50 to-transparent" />
          <p className="text-[.55rem] tracking-[.5em] text-bronze">REPUBLIC OF RITUAL</p>
          <h2 className="font-serif text-4xl md:text-5xl text-cream mt-4 leading-none">DRIP</h2>
          <p className="font-script text-3xl text-bronzelight mt-2">Passport</p>

          <div className="mt-10 space-y-5 text-sm">
            <Field label="HOLDER" value={profile.full_name} />
            <Field label="PASSPORT NO." value={profile.passport_number} />
            <Field label="ISSUED" value="Gulberg · Lahore" />
            <Field label="ENTRIES" value={`${stamps.length} inked seals`} />
          </div>

          <div className="mt-12 flex items-end justify-between">
            <div>
              <p className="text-[.45rem] tracking-[.35em] text-cream/35">SIGNATURE</p>
              <p className="font-script text-3xl text-bronze/80 mt-1">
                {profile.full_name.split(' ')[0]}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full border border-bronze/40 flex items-center justify-center">
              <svg width="28" height="20" viewBox="0 0 40 26" className="text-bronze">
                <use href="#bean" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative bg-[#efe4d2] text-ink p-6 md:p-8 min-h-[28rem]">
          <div className="absolute inset-0 opacity-[0.12] pointer-events-none passport-paper" />
          <div className="relative flex items-baseline justify-between mb-6">
            <div>
              <p className="text-[.5rem] tracking-[.4em] text-[#6f4e37]">VISAS AND SEALS</p>
              <p className="font-serif text-2xl text-[#2a1f16] mt-1">Page of journeys</p>
            </div>
            <p className="text-[.5rem] tracking-[.3em] text-[#6f4e37]">
              {`${Math.min(stamps.length, STAMP_SLOTS)} / ${STAMP_SLOTS}`}
            </p>
          </div>
          <div className="relative grid grid-cols-3 gap-3 md:gap-4">
            {slots.map((stamp, i) =>
              stamp ? (
                <StampSeal
                  key={stamp.id}
                  label={stamp.label}
                  location={stamp.location}
                  date={stamp.earned_at}
                  ink={stamp.ink_color}
                  index={i}
                />
              ) : (
                <StampSeal
                  key={`empty-${i}`}
                  label=""
                  location=""
                  date=""
                  ink="#ccc"
                  index={i}
                  empty
                />
              ),
            )}
          </div>
          <p className="relative mt-6 text-[.55rem] tracking-[.2em] text-[#6f4e37b3] text-center">
            EACH SEAL MARKS A MOMENT — NOT A DISCOUNT
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-cream/10 pb-3">
      <p className="text-[.45rem] tracking-[.35em] text-bronze/80">{label}</p>
      <p className="text-cream/85 mt-1 tracking-wide">{value}</p>
    </div>
  )
}
