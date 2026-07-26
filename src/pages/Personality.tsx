import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import gsap from 'gsap'
import { ShareCardPreview } from '../components/personality/ShareCardPreview'
import {
  emptyAnswers,
  PERSONALITIES,
  QUIZ_QUESTIONS,
  scorePersonality,
  type Answers,
  type CoffeePersonality,
} from '../data/coffeePersonality'
import { SITE } from '../data/content'
import {
  downloadPersonalityStory,
  linkedInShareUrl,
  personalityShareText,
} from '../lib/shareCardCanvas'
import { useReveal } from '../hooks/useReveal'

type Phase = 'intro' | 'quiz' | 'result'

export function Personality() {
  const [params] = useSearchParams()
  const [phase, setPhase] = useState<Phase>('intro')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  const [result, setResult] = useState<CoffeePersonality | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.title = 'Coffee Personality — DRIP'
    const preset = params.get('r')
    if (preset) {
      const found = PERSONALITIES.find((p) => p.id === preset)
      if (found) {
        setResult(found)
        setPhase('result')
      }
    }
  }, [params])

  useReveal([phase, step, result?.id])

  useEffect(() => {
    if (phase !== 'quiz') return
    gsap.fromTo(
      '.quiz-panel',
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
    )
  }, [phase, step])

  useEffect(() => {
    if (phase !== 'result' || !result) return
    gsap.fromTo(
      '.result-enter',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
    )
  }, [phase, result])

  const progress = useMemo(
    () => Math.round((step / QUIZ_QUESTIONS.length) * 100),
    [step],
  )

  function start() {
    setAnswers(emptyAnswers())
    setStep(0)
    setResult(null)
    setPhase('quiz')
  }

  function answer(value: boolean) {
    const q = QUIZ_QUESTIONS[step]
    const next = { ...answers, [q.id]: value }
    setAnswers(next)
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep((s) => s + 1)
    } else {
      const scored = scorePersonality(next)
      setResult(scored)
      setPhase('result')
    }
  }

  async function onDownload() {
    if (!result) return
    setBusy(true)
    try {
      await downloadPersonalityStory(result)
    } finally {
      setBusy(false)
    }
  }

  async function onCopyShare() {
    if (!result) return
    const text = personalityShareText(result)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      /* ignore */
    }
  }

  async function onNativeShare() {
    if (!result) return
    const text = personalityShareText(result)
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.title,
          text,
          url: `${window.location.origin}/personality?r=${result.id}`,
        })
        return
      } catch {
        /* fall through */
      }
    }
    window.open(SITE.instagram, '_blank', 'noopener,noreferrer')
  }

  const question = QUIZ_QUESTIONS[step]

  return (
    <div className="pt-36 pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {phase === 'intro' && (
          <div className="max-w-2xl mx-auto text-center">
            <p
              className="flex items-center justify-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6"
              data-reveal
            >
              <span className="eyebrow-line" /> FREE MARKETING ENGINE
            </p>
            <h1 className="font-serif text-5xl md:text-7xl text-cream leading-[1.02]" data-split>
              Coffee Personality
            </h1>
            <p className="mt-6 text-cream/55 leading-relaxed text-lg" data-reveal>
              Eight quick questions. One unforgettable result. Built to go viral on LinkedIn —
              beautiful enough for Instagram Stories.
            </p>
            <p className="mt-4 font-script text-3xl text-bronzelight" data-reveal>
              You are The Spanish Latte Person
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4" data-reveal>
              <button
                onClick={start}
                className="btn-primary magnetic px-10 py-4 text-[.62rem] font-medium"
              >
                TAKE THE QUIZ
              </button>
              <Link to="/menu" className="btn-ghost magnetic px-10 py-4 text-[.62rem]">
                SEE THE MENU
              </Link>
            </div>
            <p className="mt-8 text-[.55rem] tracking-[.3em] text-cream/30" data-reveal>
              ~45 SECONDS · NO SIGNUP · SHARE-READY
            </p>
          </div>
        )}

        {phase === 'quiz' && question && (
          <div className="max-w-xl mx-auto">
            <div className="mb-10">
              <div className="flex items-center justify-between text-[.55rem] tracking-[.35em] text-bronze mb-3">
                <span>
                  QUESTION {step + 1} / {QUIZ_QUESTIONS.length}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-px bg-cream/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-bronze to-bronzelight transition-all duration-500"
                  style={{ width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="quiz-panel text-center">
              <p className="text-[.55rem] tracking-[.4em] text-cream/40 mb-6">ANSWER HONESTLY</p>
              <h2 className="font-serif text-4xl md:text-6xl text-cream leading-tight">
                {question.prompt}
              </h2>
              <div className="mt-12 grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => answer(true)}
                  className="border border-bronze/40 bg-bronze/10 hover:bg-bronze/20 px-6 py-8 transition-colors"
                  data-hover
                >
                  <span className="block text-[.5rem] tracking-[.35em] text-bronze mb-2">YES</span>
                  <span className="font-serif text-2xl text-cream">{question.yesLabel}</span>
                </button>
                <button
                  onClick={() => answer(false)}
                  className="border border-cream/15 hover:border-bronze/40 px-6 py-8 transition-colors"
                  data-hover
                >
                  <span className="block text-[.5rem] tracking-[.35em] text-cream/40 mb-2">NO</span>
                  <span className="font-serif text-2xl text-cream">{question.noLabel}</span>
                </button>
              </div>
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="mt-8 text-[.55rem] tracking-[.3em] text-cream/40 link-lux"
                >
                  BACK
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'result' && result && (
          <div className="grid lg:grid-cols-[1fr_340px] gap-12 lg:gap-16 items-start">
            <div>
              <p className="result-enter text-[.62rem] tracking-[.5em] text-bronze mb-4">RESULT</p>
              <p className="result-enter font-serif italic text-cream/50 text-2xl">You are</p>
              <h1 className="result-enter font-serif text-5xl md:text-6xl text-cream mt-2 leading-[1.05]">
                {result.title} {result.emoji}
              </h1>
              <p className="result-enter font-script text-3xl text-bronzelight mt-3">
                {result.tagline}
              </p>
              <p className="result-enter mt-6 text-cream/60 leading-relaxed max-w-xl text-lg">
                {result.blurb}
              </p>

              <ul className="result-enter mt-8 flex flex-wrap gap-3">
                {result.traits.map((t) => (
                  <li
                    key={t}
                    className="border border-bronze/30 px-4 py-2 text-[.55rem] tracking-[.25em] text-bronzelight"
                  >
                    {t.toUpperCase()}
                  </li>
                ))}
              </ul>

              <div className="result-enter mt-10 flex flex-wrap gap-3">
                <button
                  onClick={onDownload}
                  disabled={busy}
                  className="btn-primary magnetic px-7 py-4 text-[.58rem] font-medium"
                >
                  {busy ? 'RENDERING…' : 'DOWNLOAD STORY'}
                </button>
                <button
                  onClick={onNativeShare}
                  className="btn-ghost magnetic px-7 py-4 text-[.58rem]"
                >
                  SHARE ON INSTAGRAM
                </button>
                <a
                  href={linkedInShareUrl(result)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost magnetic px-7 py-4 text-[.58rem]"
                >
                  SHARE ON LINKEDIN
                </a>
                <button
                  onClick={onCopyShare}
                  className="btn-ghost magnetic px-7 py-4 text-[.58rem]"
                >
                  {copied ? 'COPIED' : 'COPY CAPTION'}
                </button>
              </div>

              <p className="result-enter mt-6 text-[.55rem] tracking-[.25em] text-cream/35 max-w-md leading-relaxed">
                Tip: Download Story → Instagram → Your Story. Tag {SITE.instagramHandle} for free
                reach.
              </p>

              <div className="result-enter mt-10 flex flex-wrap gap-4">
                <button onClick={start} className="link-lux text-[.6rem] tracking-[.3em] text-bronzelight">
                  RETAKE QUIZ
                </button>
                <Link to="/ritual" className="link-lux text-[.6rem] tracking-[.3em] text-cream/50">
                  ORDER YOUR POUR →
                </Link>
              </div>
            </div>

            <div className="result-enter">
              <ShareCardPreview personality={result} />
              <p className="mt-4 text-center text-[.5rem] tracking-[.3em] text-cream/30">
                STORY PREVIEW · 9:16
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
