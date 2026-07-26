import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  addJournalEntry,
  fetchJournal,
  formatJournalDate,
  type JournalEntry,
} from '../lib/journalStore'
import { useReveal } from '../hooks/useReveal'

const MOODS = ['Focused', 'Soft', 'Celebrating', 'Tired', 'Inspired', 'Social']

export function Journal() {
  const { profile } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    setEntries(await fetchJournal(profile?.id))
  }, [profile?.id])

  useEffect(() => {
    document.title = 'Coffee Journal — DRIP'
    load()
  }, [load])

  useReveal([entries.length, saved])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await addJournalEntry({
      mood: String(fd.get('mood') || ''),
      coffee: String(fd.get('coffee') || ''),
      notes: String(fd.get('notes') || ''),
      userId: profile?.id,
    })
    e.currentTarget.reset()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    load()
  }

  return (
    <div className="pt-36 pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
          <span className="eyebrow-line" /> COFFEE MEMORIES
        </p>
        <h1 className="font-serif text-5xl md:text-7xl text-cream" data-split>
          Coffee Journal
        </h1>
        <p className="mt-6 max-w-xl text-cream/55 leading-relaxed" data-reveal>
          Today’s mood. Today’s pour. A few words. Later it becomes a quiet archive — July 15,
          Spanish Latte, worked on a startup.
        </p>
        {!profile && (
          <p className="mt-4 text-[.6rem] tracking-[.25em] text-cream/35" data-reveal>
            Writing as guest ·{' '}
            <Link to="/passport" className="text-bronzelight link-lux">
              open a passport
            </Link>{' '}
            to keep memories across devices
          </p>
        )}

        <div className="mt-14 grid lg:grid-cols-2 gap-12">
          <form
            onSubmit={onSubmit}
            className="bg-coal border border-cream/10 p-8 md:p-10 space-y-6"
            data-reveal
          >
            <p className="text-[.55rem] tracking-[.4em] text-bronze">TODAY’S ENTRY</p>
            <div>
              <label className="block text-[.55rem] tracking-[.35em] text-bronze mb-2">MOOD</label>
              <select name="mood" className="field" required defaultValue="">
                <option value="" disabled>
                  How do you feel?
                </option>
                {MOODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[.55rem] tracking-[.35em] text-bronze mb-2">COFFEE</label>
              <input
                name="coffee"
                className="field"
                required
                placeholder="Spanish Latte"
              />
            </div>
            <div>
              <label className="block text-[.55rem] tracking-[.35em] text-bronze mb-2">NOTES</label>
              <textarea
                name="notes"
                rows={4}
                className="field resize-none"
                placeholder="Worked on startup. Window seat. Quiet playlist."
                required
              />
            </div>
            <button type="submit" className="btn-primary magnetic w-full py-4 text-[.6rem] font-medium">
              SAVE MEMORY
            </button>
            {saved && (
              <p className="text-center text-[.55rem] tracking-[.3em] text-bronzelight">INKED</p>
            )}
          </form>

          <div data-reveal data-delay="0.1">
            <p className="text-[.55rem] tracking-[.4em] text-bronze mb-6">YOUR ARCHIVE</p>
            {entries.length === 0 && (
              <p className="text-cream/40 text-sm leading-relaxed">
                No pages yet. The first entry is the hardest — then it becomes habit.
              </p>
            )}
            <div className="space-y-6">
              {entries.map((e) => (
                <article key={e.id} className="border-b border-cream/10 pb-6">
                  <p className="text-[.55rem] tracking-[.3em] text-bronze">
                    {formatJournalDate(e.entry_date)}
                  </p>
                  <h3 className="font-serif text-2xl text-cream mt-2">{e.coffee}</h3>
                  <p className="text-[.6rem] tracking-[.25em] text-bronzelight mt-1 uppercase">
                    {e.mood}
                  </p>
                  <p className="mt-3 text-cream/55 leading-relaxed">{e.notes}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
