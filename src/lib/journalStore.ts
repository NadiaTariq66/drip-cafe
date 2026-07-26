import { supabase } from './supabase'

export interface JournalEntry {
  id: string
  user_id?: string | null
  guest_key?: string | null
  mood: string
  coffee: string
  notes: string
  entry_date: string
  created_at: string
}

const KEY = 'drip-journal-v1'

function uid() {
  return crypto.randomUUID()
}

export function guestKey() {
  const existing = localStorage.getItem('drip-guest-key')
  if (existing) return existing
  const g = `guest-${uid().slice(0, 8)}`
  localStorage.setItem('drip-guest-key', g)
  return g
}

function loadLocal(): JournalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as JournalEntry[]
  } catch {
    return []
  }
}

function saveLocal(entries: JournalEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries))
}

export async function fetchJournal(userId?: string | null): Promise<JournalEntry[]> {
  if (supabase && userId) {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
    if (data?.length) return data as JournalEntry[]
  }
  const all = loadLocal()
  const gk = guestKey()
  return all
    .filter((e) => (userId ? e.user_id === userId : e.guest_key === gk))
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date))
}

export async function addJournalEntry(input: {
  mood: string
  coffee: string
  notes: string
  userId?: string | null
}) {
  const entry: JournalEntry = {
    id: uid(),
    user_id: input.userId || null,
    guest_key: input.userId ? null : guestKey(),
    mood: input.mood.trim(),
    coffee: input.coffee.trim(),
    notes: input.notes.trim(),
    entry_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
  }

  if (supabase) {
    await supabase.from('journal_entries').insert({
      user_id: entry.user_id,
      guest_key: entry.guest_key,
      mood: entry.mood,
      coffee: entry.coffee,
      notes: entry.notes,
      entry_date: entry.entry_date,
    })
  }

  const next = [entry, ...loadLocal()]
  saveLocal(next)
  return entry
}

export function formatJournalDate(isoDate: string) {
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-GB', {
    month: 'long',
    day: 'numeric',
  })
}
