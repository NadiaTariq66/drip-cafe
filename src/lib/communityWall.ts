import { isSupabaseConfigured, supabase } from './supabase'

export type CommunityKind = 'order' | 'passport' | 'review' | 'visit' | 'ritual'

export interface CommunityEvent {
  id: string
  kind: CommunityKind
  title: string
  detail: string
  meta?: Record<string, unknown>
  created_at: string
}

const KEY = 'drip-community-v1'
const listeners = new Set<(events: CommunityEvent[]) => void>()

function uid() {
  return crypto.randomUUID()
}

function loadLocal(): CommunityEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seedLocal()
    return JSON.parse(raw) as CommunityEvent[]
  } catch {
    return seedLocal()
  }
}

function saveLocal(events: CommunityEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(events.slice(0, 40)))
  listeners.forEach((fn) => fn(events.slice(0, 40)))
}

function seedLocal(): CommunityEvent[] {
  const now = Date.now()
  const seeded: CommunityEvent[] = [
    {
      id: uid(),
      kind: 'order',
      title: 'Someone just ordered',
      detail: 'Spanish Latte',
      created_at: new Date(now - 12_000).toISOString(),
    },
    {
      id: uid(),
      kind: 'passport',
      title: 'A customer unlocked',
      detail: 'Gold Passport',
      created_at: new Date(now - 180_000).toISOString(),
    },
    {
      id: uid(),
      kind: 'review',
      title: 'A review was posted',
      detail: '“The cortado is flawless.”',
      created_at: new Date(now - 300_000).toISOString(),
    },
    {
      id: uid(),
      kind: 'visit',
      title: 'A table was verified',
      detail: 'Gulberg · DRIP-GULBERG',
      created_at: new Date(now - 480_000).toISOString(),
    },
  ]
  saveLocal(seeded)
  return seeded
}

export function relativeTime(iso: string) {
  const sec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (sec < 60) return `${sec} second${sec === 1 ? '' : 's'} ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`
  return `${Math.floor(hr / 24)} day${hr < 48 ? '' : 's'} ago`
}

export async function fetchCommunityEvents(): Promise<CommunityEvent[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('community_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
    if (!error && data?.length) return data as CommunityEvent[]
  }
  return loadLocal()
}

export async function publishCommunityEvent(
  input: Omit<CommunityEvent, 'id' | 'created_at'> & { created_at?: string },
) {
  const row: CommunityEvent = {
    id: uid(),
    created_at: input.created_at || new Date().toISOString(),
    kind: input.kind,
    title: input.title,
    detail: input.detail,
    meta: input.meta,
  }

  if (supabase) {
    await supabase.from('community_events').insert({
      kind: row.kind,
      title: row.title,
      detail: row.detail,
      meta: row.meta || {},
    })
  }

  const local = [row, ...loadLocal()].slice(0, 40)
  saveLocal(local)
  return row
}

export function subscribeCommunity(onChange: (events: CommunityEvent[]) => void) {
  listeners.add(onChange)
  onChange(loadLocal())

  let channel: { unsubscribe: () => void } | null = null
  const client = supabase
  if (client) {
    const ch = client
      .channel('community_wall')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_events' },
        async () => {
          onChange(await fetchCommunityEvents())
        },
      )
      .subscribe()
    channel = { unsubscribe: () => void client.removeChannel(ch) }
  }

  // gentle local simulation so the wall feels alive in demo mode
  const sim = window.setInterval(() => {
    if (isSupabaseConfigured) return
    const demos = [
      { kind: 'order' as const, title: 'Someone just ordered', detail: 'Cortado Coffee' },
      { kind: 'order' as const, title: 'Someone just ordered', detail: 'Tiramisu Latte' },
      { kind: 'passport' as const, title: 'A customer unlocked', detail: 'Bronze Corridor' },
      { kind: 'review' as const, title: 'A review was posted', detail: '“Free parking. Perfect pour.”' },
      { kind: 'ritual' as const, title: 'A ritual was queued', detail: 'Spanish Latte · Croissant' },
    ]
    const pick = demos[Math.floor(Math.random() * demos.length)]
    void publishCommunityEvent(pick)
  }, 28000)

  return () => {
    listeners.delete(onChange)
    channel?.unsubscribe()
    clearInterval(sim)
  }
}

export { isSupabaseConfigured }
