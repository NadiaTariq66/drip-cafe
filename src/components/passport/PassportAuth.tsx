import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'

export function PassportAuth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('up')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')
    const password = String(fd.get('password') || '')
    const fullName = String(fd.get('fullName') || '')
    try {
      if (mode === 'up') await signUp(email, password, fullName)
      else await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open your passport.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto" data-reveal>
      <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6">
        <span className="eyebrow-line" /> ISSUE / ENTRY
      </p>
      <h1 className="font-serif text-5xl md:text-6xl text-cream">Your Drip Passport</h1>
      <p className="mt-5 text-cream/55 leading-relaxed">
        A leather-bound book of seals — not a punch card. Sign in to collect stamps from completed
        orders and verified visits across Gulberg, DHA and Adda.
      </p>

      <div className="mt-8 inline-flex border border-cream/15 overflow-hidden">
        <button
          type="button"
          onClick={() => setMode('up')}
          className={`px-5 py-2.5 text-[.58rem] tracking-[.3em] ${
            mode === 'up' ? 'bg-bronze text-ink' : 'text-cream/50'
          }`}
        >
          ISSUE PASSPORT
        </button>
        <button
          type="button"
          onClick={() => setMode('in')}
          className={`px-5 py-2.5 text-[.58rem] tracking-[.3em] ${
            mode === 'in' ? 'bg-bronze text-ink' : 'text-cream/50'
          }`}
        >
          RETURN
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-8 bg-coal border border-cream/10 p-8 space-y-6">
        {mode === 'up' && (
          <div>
            <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">FULL NAME</label>
            <input name="fullName" className="field" required placeholder="As it should appear" />
          </div>
        )}
        <div>
          <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">EMAIL</label>
          <input name="email" type="email" className="field" required placeholder="you@email.com" />
        </div>
        <div>
          <label className="block text-[.55rem] tracking-[.4em] text-bronze mb-1">PASSWORD</label>
          <input name="password" type="password" className="field" required minLength={6} placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-red-400/80">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary magnetic w-full py-4 text-[.62rem] font-medium"
        >
          {loading ? 'OPENING…' : mode === 'up' ? 'OPEN MY PASSPORT' : 'ENTER'}
        </button>
        <p className="text-center text-[.55rem] tracking-[.25em] text-cream/30">
          {isSupabaseConfigured
            ? 'SECURED WITH SUPABASE AUTH'
            : 'LOCAL DEMO AUTH · USE ADMIN@DRIP.PK FOR ADMIN'}
        </p>
      </form>
    </div>
  )
}
