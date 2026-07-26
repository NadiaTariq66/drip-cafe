import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useAuth } from '../context/AuthContext'
import { fetchPulse } from '../lib/api'
import { detectWeather } from '../lib/weatherEngine'
import { publishCommunityEvent } from '../lib/communityWall'
import type { CafePulse } from '../lib/types'
import { useReveal } from '../hooks/useReveal'

type Msg = { from: 'concierge' | 'you'; text: string }

type Step =
  | 'greet'
  | 'working'
  | 'focus'
  | 'recommend'
  | 'done'

export function Concierge() {
  const { profile } = useAuth()
  const name = profile?.full_name?.split(' ')[0] || 'friend'
  const [step, setStep] = useState<Step>('greet')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [pulse, setPulse] = useState<CafePulse | null>(null)
  const [drink, setDrink] = useState('Spanish Latte')
  const [pastry, setPastry] = useState('Butter Croissant')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Coffee Concierge — DRIP'
    fetchPulse().then(setPulse)
    detectWeather().then((w) => {
      setDrink(w.recommendation.drink)
      if (w.mood === 'heat') setPastry('Hot Honey Croissant Sando')
      else if (w.mood === 'night') setPastry('Basque Cheesecake')
      else setPastry('Butter Croissant')
    })
  }, [])

  useEffect(() => {
    setMsgs([
      {
        from: 'concierge',
        text: `Hi ${name}. Welcome to DRIP. Working today?`,
      },
    ])
    setStep('working')
  }, [name])

  useReveal([step])

  useEffect(() => {
    if (!listRef.current) return
    gsap.fromTo(
      listRef.current.lastElementChild,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
    )
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [msgs])

  function push(from: Msg['from'], text: string) {
    setMsgs((m) => [...m, { from, text }])
  }

  function replyWorking(yes: boolean) {
    push('you', yes ? 'Yes' : 'Not really')
    if (yes) {
      setTimeout(() => {
        push('concierge', 'Need focus?')
        setStep('focus')
      }, 450)
    } else {
      setTimeout(() => {
        push(
          'concierge',
          `Then something softer. I recommend ${drink} + ${pastry}. Today's wait is about ${pulse?.avg_wait_minutes ?? 8} minutes. Reserve?`,
        )
        setStep('recommend')
      }, 450)
    }
  }

  function replyFocus(yes: boolean) {
    push('you', yes ? 'Yes' : 'Keep it easy')
    const pickDrink = yes ? 'Cortado Coffee' : drink
    const pickPastry = yes ? 'Walnut Sourdough' : pastry
    setDrink(pickDrink)
    setPastry(pickPastry)
    setTimeout(() => {
      push(
        'concierge',
        `I recommend ${pickDrink} + ${pickPastry}. Today's wait — ${pulse?.avg_wait_minutes ?? 8} minutes. Shall I hold a seat?`,
      )
      setStep('recommend')
    }, 500)
  }

  async function reserveYes() {
    push('you', 'Reserve')
    setTimeout(async () => {
      push(
        'concierge',
        `Consider it noted — ${drink} waiting, table light on. See you in Gulberg.`,
      )
      setStep('done')
      await publishCommunityEvent({
        kind: 'ritual',
        title: 'Concierge queued a ritual',
        detail: `${drink} · ${pastry}`,
      })
    }, 400)
  }

  return (
    <div className="pt-36 pb-28 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
          <span className="eyebrow-line" /> NOT A CHATBOT
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-cream" data-split>
          Coffee Concierge
        </h1>
        <p className="mt-5 text-cream/55 max-w-lg leading-relaxed" data-reveal>
          A luxury brand assistant — short questions, precise pours, live wait times. Never generic.
          Never noisy.
        </p>

        <div
          className="mt-12 border border-cream/10 bg-coal/90 rounded-sm overflow-hidden"
          data-reveal
        >
          <div className="px-6 py-4 border-b border-cream/10 flex items-center justify-between">
            <p className="text-[.55rem] tracking-[.35em] text-bronze">DRIP HOUSE · CONCIERGE</p>
            <p className="text-[.5rem] tracking-[.25em] text-cream/35">
              WAIT ~{pulse?.avg_wait_minutes ?? 8} MIN
            </p>
          </div>

          <div ref={listRef} className="px-6 py-8 space-y-5 max-h-[28rem] overflow-y-auto no-scrollbar">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] ${m.from === 'you' ? 'ml-auto text-right' : ''}`}
              >
                <p className="text-[.45rem] tracking-[.3em] text-cream/30 mb-1">
                  {m.from === 'you' ? 'YOU' : 'CONCIERGE'}
                </p>
                <p
                  className={`inline-block px-5 py-3 text-sm leading-relaxed ${
                    m.from === 'you'
                      ? 'bg-bronze/20 border border-bronze/30 text-cream'
                      : 'bg-ink border border-cream/10 text-cream/80'
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
          </div>

          <div className="px-6 py-5 border-t border-cream/10 flex flex-wrap gap-3">
            {step === 'working' && (
              <>
                <button onClick={() => replyWorking(true)} className="btn-primary px-6 py-3 text-[.55rem] font-medium">
                  YES
                </button>
                <button onClick={() => replyWorking(false)} className="btn-ghost px-6 py-3 text-[.55rem]">
                  NOT TODAY
                </button>
              </>
            )}
            {step === 'focus' && (
              <>
                <button onClick={() => replyFocus(true)} className="btn-primary px-6 py-3 text-[.55rem] font-medium">
                  NEED FOCUS
                </button>
                <button onClick={() => replyFocus(false)} className="btn-ghost px-6 py-3 text-[.55rem]">
                  KEEP IT EASY
                </button>
              </>
            )}
            {step === 'recommend' && (
              <>
                <button onClick={reserveYes} className="btn-primary px-6 py-3 text-[.55rem] font-medium">
                  RESERVE
                </button>
                <Link to="/ritual" className="btn-ghost px-6 py-3 text-[.55rem]">
                  BUILD RITUAL
                </Link>
              </>
            )}
            {step === 'done' && (
              <>
                <Link to="/reserve" className="btn-primary px-6 py-3 text-[.55rem] font-medium">
                  CONFIRM TABLE
                </Link>
                <button
                  onClick={() => {
                    setMsgs([{ from: 'concierge', text: `Hi ${name}. Working today?` }])
                    setStep('working')
                  }}
                  className="btn-ghost px-6 py-3 text-[.55rem]"
                >
                  START AGAIN
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
