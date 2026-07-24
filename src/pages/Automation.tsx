import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  fetchAutomations,
  fetchPulse,
  fetchReservations,
  fetchRituals,
  fetchWaitlist,
  isSupabaseConfigured,
  notifyWaitlistGuest,
  triggerReviewRequest,
  updatePulse,
} from '../lib/api'
import { DEFAULT_PULSE } from '../data/content'
import type { AutomationLog, CafePulse, Reservation, RitualOrder, WaitlistEntry } from '../lib/types'
import { useReveal } from '../hooks/useReveal'

export function Automation() {
  const [pulse, setPulse] = useState<CafePulse>(DEFAULT_PULSE)
  const [logs, setLogs] = useState<AutomationLog[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [rituals, setRituals] = useState<RitualOrder[]>([])
  const [busy, setBusy] = useState(35)

  const refresh = useCallback(async () => {
    const [p, a, r, w, ri] = await Promise.all([
      fetchPulse(),
      fetchAutomations(),
      fetchReservations(),
      fetchWaitlist(),
      fetchRituals(),
    ])
    setPulse(p)
    setBusy(p.busy_level)
    setLogs(a)
    setReservations(r)
    setWaitlist(w)
    setRituals(ri)
  }, [])

  useReveal([logs.length, waitlist.length, rituals.length])
  useEffect(() => {
    document.title = 'Pulse Desk — DRIP'
    refresh()
    const t = setInterval(refresh, 8000)
    return () => clearInterval(t)
  }, [refresh])

  async function savePulse(e: FormEvent) {
    e.preventDefault()
    const note =
      busy < 30 ? 'Quiet — great time to visit' : busy < 60 ? 'Less busy than usual' : busy < 80 ? 'Getting busy' : 'Peak hour'
    const next = {
      busy_level: busy,
      live_note: note,
      avg_wait_minutes: Math.max(5, Math.round(busy / 5)),
    }
    await updatePulse(next)
    setPulse(next)
    refresh()
  }

  return (
    <div className="pt-36 pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
              <span className="eyebrow-line" /> STAFF · AUTOMATION
            </p>
            <h1 className="font-serif text-5xl md:text-7xl text-cream" data-split>
              Pulse Desk
            </h1>
            <p className="mt-4 text-cream/50 max-w-xl" data-reveal>
              Live ops board: busy meter, waitlist pings, ritual tickets, reservation auto-confirm,
              and review-request automations — all stored in Supabase when connected.
            </p>
          </div>
          <div
            className={`text-[.55rem] tracking-[.3em] px-4 py-2 border ${
              isSupabaseConfigured
                ? 'border-emerald-500/40 text-emerald-400/90'
                : 'border-bronze/40 text-bronzelight'
            }`}
            data-reveal
          >
            {isSupabaseConfigured ? 'SUPABASE LIVE' : 'LOCAL DEMO MODE'}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <form
            onSubmit={savePulse}
            className="lg:col-span-1 bg-coal border border-cream/10 p-8 rounded-sm"
            data-reveal
          >
            <p className="text-[.55rem] tracking-[.4em] text-bronze mb-4">BUSY METER</p>
            <p className="font-serif text-5xl text-bronzelight mb-2">{busy}%</p>
            <p className="text-sm text-cream/45 mb-6">{pulse.live_note}</p>
            <input
              type="range"
              min={0}
              max={100}
              value={busy}
              onChange={(e) => setBusy(Number(e.target.value))}
              className="w-full accent-bronze"
            />
            <button type="submit" className="btn-primary magnetic w-full mt-6 py-3 text-[.58rem] font-medium">
              UPDATE LIVE PULSE
            </button>
          </form>

          <div className="bg-coal border border-cream/10 p-8 rounded-sm" data-reveal data-delay="0.1">
            <p className="text-[.55rem] tracking-[.4em] text-bronze mb-4">TODAY</p>
            <div className="space-y-4">
              <Stat label="Reservations" value={reservations.length} />
              <Stat label="Waitlist" value={waitlist.filter((w) => w.status === 'waiting').length} />
              <Stat label="Rituals queued" value={rituals.length} />
              <Stat label="Automations fired" value={logs.length} />
            </div>
          </div>

          <div className="bg-coal border border-cream/10 p-8 rounded-sm" data-reveal data-delay="0.2">
            <p className="text-[.55rem] tracking-[.4em] text-bronze mb-4">QUICK ACTIONS</p>
            <div className="space-y-3">
              <button
                className="btn-ghost w-full py-3 text-[.55rem]"
                onClick={async () => {
                  await triggerReviewRequest('Recent Guest', '03XXXXXXXXX')
                  refresh()
                }}
              >
                SEND REVIEW REQUEST
              </button>
              <button
                className="btn-ghost w-full py-3 text-[.55rem]"
                onClick={async () => {
                  const first = waitlist[0]
                  if (!first) return
                  await notifyWaitlistGuest(first)
                  refresh()
                }}
              >
                PING NEXT WAITLIST GUEST
              </button>
              <p className="text-[.7rem] text-cream/40 leading-relaxed pt-2">
                Auto rules: ≤4 guests → instant confirm · Ritual → kitchen ticket · Waitlist join →
                ETA SMS log · Post-visit → Google review nudge.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <Panel title="WAITLIST">
            {waitlist.length === 0 && <Empty>No guests waiting — demo joins appear here.</Empty>}
            {waitlist.map((w) => (
              <Row
                key={w.id}
                title={`#${w.position} ${w.name}`}
                meta={`${w.party_size} guests · ETA ${w.eta_minutes}m · ${w.phone}`}
                action="TABLE READY"
                onAction={async () => {
                  await notifyWaitlistGuest(w)
                  refresh()
                }}
              />
            ))}
          </Panel>

          <Panel title="RITUAL TICKETS">
            {rituals.length === 0 && <Empty>Queue a ritual on /ritual to see bar tickets.</Empty>}
            {rituals.map((r) => (
              <Row
                key={r.id}
                title={`${r.drink}${r.pastry ? ` + ${r.pastry}` : ''}`}
                meta={`${r.name} · ${r.pickup_time || r.time_of_day} · ${r.status}`}
              />
            ))}
          </Panel>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Panel title="RESERVATIONS">
            {reservations.length === 0 && <Empty>New bookings from /reserve land here.</Empty>}
            {reservations.map((r) => (
              <Row
                key={r.id}
                title={r.name}
                meta={`${r.date} ${r.time} · ${r.guests} guests · ${r.status}${
                  r.auto_confirmed ? ' · AUTO' : ''
                }`}
              />
            ))}
          </Panel>

          <Panel title="AUTOMATION LOG">
            {logs.length === 0 && <Empty>Actions will stream here as guests use the site.</Empty>}
            {logs.map((l) => (
              <div key={l.id} className="py-4 border-b border-cream/10 last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[.55rem] tracking-[.3em] text-bronze">{l.type.toUpperCase()}</p>
                  <p className="text-[.55rem] text-cream/30">
                    {new Date(l.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <p className="text-cream/80 mt-1 text-sm">{l.title}</p>
              </div>
            ))}
          </Panel>
        </div>

        {!isSupabaseConfigured && (
          <p className="mt-10 text-center text-[.65rem] tracking-[.25em] text-cream/35" data-reveal>
            Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY and run supabase/schema.sql for cloud sync
          </p>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-end justify-between border-b border-cream/10 pb-3">
      <span className="text-cream/50 text-sm">{label}</span>
      <span className="font-serif text-3xl text-bronzelight">{value}</span>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-soot border border-cream/10 rounded-sm p-8" data-reveal>
      <p className="text-[.55rem] tracking-[.4em] text-bronze mb-6">{title}</p>
      <div className="max-h-[22rem] overflow-y-auto no-scrollbar">{children}</div>
    </div>
  )
}

function Row({
  title,
  meta,
  action,
  onAction,
}: {
  title: string
  meta: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="py-4 border-b border-cream/10 last:border-0 flex items-start justify-between gap-4">
      <div>
        <p className="font-serif text-xl text-cream">{title}</p>
        <p className="text-sm text-cream/45 mt-1">{meta}</p>
      </div>
      {action && onAction && (
        <button onClick={onAction} className="shrink-0 text-[.5rem] tracking-[.25em] text-bronzelight link-lux">
          {action}
        </button>
      )}
    </div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-cream/35 py-6">{children}</p>
}
