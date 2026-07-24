import { DEFAULT_PULSE, MENU, REVIEWS } from '../data/content'
import type {
  AutomationLog,
  CafePulse,
  MenuItem,
  Reservation,
  Review,
  RitualOrder,
  WaitlistEntry,
} from './types'
import { isSupabaseConfigured, supabase } from './supabase'

const localStore = {
  reservations: [] as Reservation[],
  waitlist: [] as WaitlistEntry[],
  rituals: [] as RitualOrder[],
  automations: [] as AutomationLog[],
  newsletter: [] as string[],
  pulse: { ...DEFAULT_PULSE },
}

function uid() {
  return crypto.randomUUID()
}

async function logAutomation(type: string, title: string, payload: Record<string, unknown>) {
  const entry: AutomationLog = {
    id: uid(),
    type,
    title,
    payload,
    status: 'sent',
    created_at: new Date().toISOString(),
  }

  if (supabase) {
    await supabase.from('automations').insert({
      type,
      title,
      payload,
      status: 'sent',
    })
  } else {
    localStore.automations.unshift(entry)
  }

  return entry
}

export async function fetchMenu(): Promise<MenuItem[]> {
  if (!supabase) return MENU
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('available', true)
    .order('sort_order')
  if (error || !data?.length) return MENU
  return data as MenuItem[]
}

export async function fetchReviews(): Promise<Review[]> {
  if (!supabase) return REVIEWS
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data?.length) return REVIEWS
  return data as Review[]
}

export async function fetchPulse(): Promise<CafePulse> {
  if (!supabase) return localStore.pulse
  const { data, error } = await supabase.from('cafe_pulse').select('*').eq('id', 1).maybeSingle()
  if (error || !data) return localStore.pulse
  return {
    busy_level: data.busy_level,
    live_note: data.live_note,
    avg_wait_minutes: data.avg_wait_minutes,
  }
}

export async function updatePulse(pulse: CafePulse) {
  localStore.pulse = pulse
  if (supabase) {
    await supabase
      .from('cafe_pulse')
      .upsert({ id: 1, ...pulse, updated_at: new Date().toISOString() })
  }
  await logAutomation('pulse', `Busy level set to ${pulse.busy_level}%`, { ...pulse })
  return pulse
}

export async function createReservation(input: Reservation) {
  const auto = input.guests <= 4
  const row = { ...input, status: auto ? 'confirmed' : 'pending', auto_confirmed: auto }

  if (supabase) {
    const { data, error } = await supabase.from('reservations').insert(row).select().single()
    if (error) throw error
    await logAutomation(
      'reservation',
      auto ? `Auto-confirmed table for ${input.name}` : `Pending review: ${input.name}`,
      { ...row, id: data.id },
    )
    if (auto) {
      await logAutomation('whatsapp', `WhatsApp confirmation queued for ${input.phone}`, {
        phone: input.phone,
        message: `DRIP: Your table for ${input.guests} on ${input.date} at ${input.time} is confirmed.`,
      })
    }
    return data as Reservation
  }

  const local = { ...row, id: uid() }
  localStore.reservations.unshift(local)
  await logAutomation(
    'reservation',
    auto ? `Auto-confirmed table for ${input.name}` : `Pending review: ${input.name}`,
    local as unknown as Record<string, unknown>,
  )
  if (auto) {
    await logAutomation('whatsapp', `WhatsApp confirmation queued for ${input.phone}`, {
      phone: input.phone,
    })
  }
  return local
}

export async function joinWaitlist(input: WaitlistEntry) {
  const position = (localStore.waitlist.filter((w) => w.status === 'waiting').length || 0) + 1
  const eta = position * 8
  const row = { ...input, status: 'waiting', position, eta_minutes: eta }

  if (supabase) {
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'waiting')
    const pos = (count || 0) + 1
    const payload = { ...input, status: 'waiting', position: pos, eta_minutes: pos * 8 }
    const { data, error } = await supabase.from('waitlist').insert(payload).select().single()
    if (error) throw error
    await logAutomation('waitlist', `${input.name} joined waitlist (#${pos})`, payload)
    return data as WaitlistEntry
  }

  const local = { ...row, id: uid(), created_at: new Date().toISOString() }
  localStore.waitlist.unshift(local)
  await logAutomation('waitlist', `${input.name} joined waitlist (#${position})`, local as unknown as Record<string, unknown>)
  return local
}

export async function createRitual(input: RitualOrder) {
  const row = { ...input, status: 'queued' }

  if (supabase) {
    const { data, error } = await supabase.from('rituals').insert(row).select().single()
    if (error) throw error
    await logAutomation('ritual', `Ritual queued: ${input.drink} for ${input.name}`, {
      ...row,
      id: data.id,
    })
    await logAutomation('kitchen', `Bar ticket printed — ready in ~12 min`, {
      drink: input.drink,
      pastry: input.pastry,
      pickup_time: input.pickup_time,
    })
    return data as RitualOrder
  }

  const local = { ...row, id: uid() }
  localStore.rituals.unshift(local)
  await logAutomation('ritual', `Ritual queued: ${input.drink} for ${input.name}`, local as unknown as Record<string, unknown>)
  await logAutomation('kitchen', `Bar ticket printed — ready in ~12 min`, {
    drink: input.drink,
    pastry: input.pastry,
  })
  return local
}

export async function subscribeNewsletter(email: string) {
  if (supabase) {
    const { error } = await supabase.from('newsletter').insert({ email })
    if (error && !error.message.includes('duplicate')) throw error
  } else {
    localStore.newsletter.push(email)
  }
  await logAutomation('newsletter', `Sunday letter: ${email} joined`, { email })
}

export async function fetchAutomations(): Promise<AutomationLog[]> {
  if (!supabase) return localStore.automations
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(40)
  if (error || !data) return localStore.automations
  return data as AutomationLog[]
}

export async function fetchReservations(): Promise<Reservation[]> {
  if (!supabase) return localStore.reservations
  const { data } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)
  return (data || []) as Reservation[]
}

export async function fetchWaitlist(): Promise<WaitlistEntry[]> {
  if (!supabase) return localStore.waitlist
  const { data } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)
  return (data || []) as WaitlistEntry[]
}

export async function fetchRituals(): Promise<RitualOrder[]> {
  if (!supabase) return localStore.rituals
  const { data } = await supabase
    .from('rituals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)
  return (data || []) as RitualOrder[]
}

export async function triggerReviewRequest(name: string, phone: string) {
  return logAutomation('review_request', `Review request sent to ${name}`, {
    phone,
    message: `Hi ${name}, thanks for visiting DRIP. Mind leaving a Google review?`,
  })
}

export async function notifyWaitlistGuest(entry: WaitlistEntry) {
  return logAutomation('waitlist_ping', `Table ready ping → ${entry.name}`, {
    phone: entry.phone,
    message: `${entry.name}, your table at DRIP is ready. Come within 10 minutes.`,
  })
}

export function whatsappLink(text: string) {
  const phone = '923269993000'
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

export { isSupabaseConfigured }
