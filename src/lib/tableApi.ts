import { CAFE_TABLES, type CafeTable, type OrderStatus, type TableRequest, type TableSession } from '../data/tables'
import { publishCommunityEvent } from './communityWall'
import { isSupabaseConfigured, supabase } from './supabase'

const KEY = 'drip-tables-v1'
const listeners = new Set<() => void>()

type Db = {
  sessions: TableSession[]
  requests: TableRequest[]
}

function uid() {
  return crypto.randomUUID()
}

function notify() {
  listeners.forEach((fn) => fn())
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed()
    return JSON.parse(raw) as Db
  } catch {
    return seed()
  }
}

function save(db: Db) {
  localStorage.setItem(KEY, JSON.stringify(db))
  notify()
}

function seed(): Db {
  const now = new Date().toISOString()
  const db: Db = {
    sessions: [
      {
        id: uid(),
        table_code: 'G12',
        status: 'dining',
        guest_name: 'Guest',
        current_drink: 'Spanish Latte',
        current_item: 'Butter Croissant',
        order_status: 'brewing',
        order_note: 'Less sweet',
        updated_at: now,
        created_at: now,
      },
      {
        id: uid(),
        table_code: 'G07',
        status: 'dining',
        current_drink: 'Cortado Coffee',
        order_status: 'on_the_way',
        updated_at: now,
        created_at: now,
      },
      {
        id: uid(),
        table_code: 'W03',
        status: 'open',
        current_drink: '',
        order_status: 'idle',
        updated_at: now,
        created_at: now,
      },
    ],
    requests: [],
  }
  save(db)
  return db
}

export function listTables(): CafeTable[] {
  return CAFE_TABLES
}

export function getTable(code: string): CafeTable | undefined {
  return CAFE_TABLES.find((t) => t.code === code.toUpperCase())
}

export async function getOrCreateSession(tableCode: string): Promise<TableSession> {
  const code = tableCode.toUpperCase()
  if (supabase) {
    const { data: existing } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('table_code', code)
      .neq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (existing) return existing as TableSession

    const row = {
      table_code: code,
      status: 'open',
      current_drink: 'Spanish Latte',
      current_item: 'Butter Croissant',
      order_status: 'brewing',
      order_note: 'Demo session',
    }
    const { data, error } = await supabase.from('table_sessions').insert(row).select().single()
    if (!error && data) return data as TableSession
  }

  const db = load()
  let session = db.sessions.find((s) => s.table_code === code && s.status !== 'closed')
  if (!session) {
    const now = new Date().toISOString()
    session = {
      id: uid(),
      table_code: code,
      status: 'dining',
      current_drink: 'Spanish Latte',
      current_item: 'Butter Croissant',
      order_status: 'brewing',
      updated_at: now,
      created_at: now,
    }
    db.sessions.unshift(session)
    save(db)
  }
  return session
}

export async function updateSession(
  sessionId: string,
  patch: Partial<TableSession>,
): Promise<TableSession | null> {
  if (supabase) {
    const { data } = await supabase
      .from('table_sessions')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single()
    if (data) return data as TableSession
  }

  const db = load()
  const idx = db.sessions.findIndex((s) => s.id === sessionId)
  if (idx < 0) return null
  db.sessions[idx] = {
    ...db.sessions[idx],
    ...patch,
    updated_at: new Date().toISOString(),
  }
  save(db)
  return db.sessions[idx]
}

export async function setOrderStatus(sessionId: string, order_status: OrderStatus) {
  return updateSession(sessionId, {
    order_status,
    status: order_status === 'billed' ? 'closing' : 'dining',
  })
}

export async function createTableRequest(input: {
  table_code: string
  session_id?: string
  kind: TableRequest['kind']
  message?: string
}) {
  const row: TableRequest = {
    id: uid(),
    table_code: input.table_code.toUpperCase(),
    session_id: input.session_id,
    kind: input.kind,
    message: input.message,
    status: 'open',
    created_at: new Date().toISOString(),
  }

  if (supabase) {
    await supabase.from('table_requests').insert({
      table_code: row.table_code,
      session_id: row.session_id,
      kind: row.kind,
      message: row.message,
      status: 'open',
    })
  }

  const db = load()
  db.requests.unshift(row)
  save(db)

  const titles: Record<TableRequest['kind'], string> = {
    waiter: 'Waiter called',
    bill: 'Bill requested',
    water: 'Water refill asked',
    feedback: 'Table feedback left',
  }
  await publishCommunityEvent({
    kind: 'visit',
    title: titles[row.kind],
    detail: `Table ${row.table_code}${row.message ? ` · ${row.message}` : ''}`,
  })

  return row
}

export async function listOpenRequests(): Promise<TableRequest[]> {
  if (supabase) {
    const { data } = await supabase
      .from('table_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(40)
    if (data) return data as TableRequest[]
  }
  return load().requests.filter((r) => r.status === 'open')
}

export async function listActiveSessions(): Promise<TableSession[]> {
  if (supabase) {
    const { data } = await supabase
      .from('table_sessions')
      .select('*')
      .neq('status', 'closed')
      .order('updated_at', { ascending: false })
    if (data) return data as TableSession[]
  }
  return load().sessions.filter((s) => s.status !== 'closed')
}

export async function ackRequest(id: string) {
  if (supabase) {
    await supabase.from('table_requests').update({ status: 'acked' }).eq('id', id)
  }
  const db = load()
  db.requests = db.requests.map((r) => (r.id === id ? { ...r, status: 'acked' as const } : r))
  save(db)
}

export function subscribeTables(onChange: () => void) {
  listeners.add(onChange)

  let channel: { unsubscribe: () => void } | null = null
  const client = supabase
  if (client) {
    const ch = client
      .channel('digital_tables')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_sessions' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_requests' }, onChange)
      .subscribe()
    channel = { unsubscribe: () => void client.removeChannel(ch) }
  }

  // demo: gently advance brewing → on_the_way → served
  const sim = window.setInterval(() => {
    if (isSupabaseConfigured) return
    const db = load()
    let changed = false
    db.sessions = db.sessions.map((s) => {
      if (s.order_status === 'brewing') {
        changed = true
        return { ...s, order_status: 'on_the_way', updated_at: new Date().toISOString() }
      }
      if (s.order_status === 'on_the_way') {
        changed = true
        return { ...s, order_status: 'served', updated_at: new Date().toISOString() }
      }
      return s
    })
    if (changed) save(db)
  }, 22000)

  return () => {
    listeners.delete(onChange)
    channel?.unsubscribe()
    clearInterval(sim)
  }
}

export { isSupabaseConfigured }
