import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { useAuth } from '../context/AuthContext'
import {
  ORDER_STATUS_LABEL,
  pairingsFor,
  tableUrl,
  type OrderStatus,
  type TableSession,
} from '../data/tables'
import { SITE } from '../data/content'
import { completeOrderStamp } from '../lib/passportApi'
import {
  createTableRequest,
  getOrCreateSession,
  getTable,
  subscribeTables,
  updateSession,
} from '../lib/tableApi'
import { useReveal } from '../hooks/useReveal'

const STATUS_STEPS: OrderStatus[] = ['received', 'brewing', 'on_the_way', 'served']

export function Table() {
  const { tableCode = '' } = useParams()
  const code = tableCode.toUpperCase()
  const table = getTable(code)
  const { profile } = useAuth()
  const [session, setSession] = useState<TableSession | null>(null)
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const load = useCallback(async () => {
    if (!getTable(code)) return
    setSession(await getOrCreateSession(code))
  }, [code])

  useEffect(() => {
    document.title = table ? `${table.label} — Digital Coffee Table` : 'Table — DRIP'
    load()
    return subscribeTables(() => {
      void load()
    })
  }, [load, table])

  useReveal([session?.order_status, toast, feedbackOpen])

  useEffect(() => {
    if (!toast) return
    gsap.fromTo('#table-toast', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 })
    const t = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const pairings = useMemo(
    () => pairingsFor(session?.current_drink || 'Spanish Latte'),
    [session?.current_drink],
  )

  const stepIndex = STATUS_STEPS.indexOf(
    (session?.order_status === 'idle' ? 'received' : session?.order_status) as OrderStatus,
  )

  async function ping(kind: 'waiter' | 'bill' | 'water', message?: string) {
    if (!session) return
    setBusy(true)
    try {
      await createTableRequest({
        table_code: code,
        session_id: session.id,
        kind,
        message,
      })
      if (kind === 'bill') {
        await updateSession(session.id, { order_status: 'billed', status: 'closing' })
        await load()
      }
      setToast(
        kind === 'waiter'
          ? 'Waiter on the way'
          : kind === 'bill'
            ? 'Bill requested'
            : 'Water refill noted',
      )
    } finally {
      setBusy(false)
    }
  }

  async function onFeedback(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!session) return
    const note = String(new FormData(e.currentTarget).get('note') || '').trim()
    if (!note) return
    setBusy(true)
    try {
      await createTableRequest({
        table_code: code,
        session_id: session.id,
        kind: 'feedback',
        message: note,
      })
      setFeedbackOpen(false)
      setToast('Thank you — feedback sent')
      e.currentTarget.reset()
    } finally {
      setBusy(false)
    }
  }

  async function saveToPassport() {
    if (!session?.current_drink) return
    if (!profile) {
      setToast('Open Passport first to save this pour')
      return
    }
    setBusy(true)
    try {
      await completeOrderStamp(profile.id, {
        drink: session.current_drink,
        pastry: session.current_item,
      })
      setToast('Saved to Drip Passport')
    } catch {
      setToast('Could not ink passport')
    } finally {
      setBusy(false)
    }
  }

  function shareMoment() {
    const drink = session?.current_drink || 'coffee'
    const text = `Today at DRIP · Table ${code}\n${drink}${session?.current_item ? ` + ${session.current_item}` : ''}\n${SITE.instagramHandle}`
    const url = tableUrl(code)
    if (navigator.share) {
      void navigator.share({ title: `DRIP Table ${code}`, text, url }).catch(() => {
        window.open(SITE.instagram, '_blank', 'noopener,noreferrer')
      })
      return
    }
    void navigator.clipboard?.writeText(`${text}\n${url}`)
    window.open(SITE.instagram, '_blank', 'noopener,noreferrer')
    setToast('Caption copied — open Instagram')
  }

  if (!table) {
    return (
      <div className="pt-40 pb-28 px-6 text-center">
        <h1 className="font-serif text-4xl text-cream">Unknown table</h1>
        <p className="mt-4 text-cream/50">Scan a DRIP table QR, or try /table/G12</p>
        <Link to="/tables" className="btn-ghost inline-block mt-8 px-6 py-3 text-[.58rem]">
          STAFF TABLE DESK
        </Link>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="pt-40 pb-28 text-center text-[.6rem] tracking-[.4em] text-cream/40">
        OPENING YOUR TABLE…
      </div>
    )
  }

  return (
    <div className="pt-28 pb-24 min-h-screen">
      {toast && (
        <div
          id="table-toast"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] bg-ink/95 border border-bronze/50 px-5 py-3 text-[.58rem] tracking-[.28em] text-bronzelight"
        >
          {toast.toUpperCase()}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <div className="flex items-start justify-between gap-4 mb-8" data-reveal>
          <div>
            <p className="text-[.55rem] tracking-[.45em] text-bronze">DIGITAL COFFEE TABLE</p>
            <h1 className="font-serif text-4xl md:text-5xl text-cream mt-2">{table.label}</h1>
            <p className="mt-2 text-[.6rem] tracking-[.3em] text-cream/40">
              {table.zone.toUpperCase()} · {table.seats} SEATS · {code}
            </p>
          </div>
          <Link to="/tables" className="text-[.5rem] tracking-[.25em] text-cream/35 link-lux shrink-0 mt-2">
            STAFF
          </Link>
        </div>

        {/* Order status */}
        <section className="border border-cream/10 bg-coal p-6 md:p-8 mb-6" data-reveal>
          <p className="text-[.55rem] tracking-[.35em] text-bronze mb-2">CURRENT ORDER</p>
          <h2 className="font-serif text-3xl text-cream">
            {session.current_drink || '—'}
            {session.current_item ? (
              <span className="text-bronzelight"> + {session.current_item}</span>
            ) : null}
          </h2>
          {session.order_note && (
            <p className="mt-2 text-sm text-cream/45">Note: {session.order_note}</p>
          )}
          <p className="mt-4 text-[.65rem] tracking-[.25em] text-bronzelight">
            {ORDER_STATUS_LABEL[session.order_status]}
          </p>

          <div className="mt-6 flex gap-2">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1 rounded-full ${
                    i <= Math.max(0, stepIndex) ? 'bg-bronze' : 'bg-cream/10'
                  }`}
                />
                <p className="mt-2 text-[.4rem] tracking-[.15em] text-cream/35 uppercase truncate">
                  {s.replaceAll('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pairings */}
        <section className="border border-cream/10 bg-soot/80 p-6 md:p-8 mb-6" data-reveal>
          <p className="text-[.55rem] tracking-[.35em] text-bronze mb-4">RECOMMENDED PAIRINGS</p>
          <div className="space-y-4">
            {pairings.map((p) => (
              <div key={p.name} className="flex items-start justify-between gap-4 border-b border-cream/10 pb-4 last:border-0 last:pb-0">
                <div>
                  <h3 className="font-serif text-xl text-cream">{p.name}</h3>
                  <p className="text-sm text-cream/45 mt-1">{p.reason}</p>
                </div>
                <button
                  disabled={busy}
                  onClick={async () => {
                    await updateSession(session.id, {
                      current_item: p.name,
                      order_status: session.order_status === 'idle' ? 'received' : session.order_status,
                    })
                    await load()
                    setToast(`Added ${p.name}`)
                  }}
                  className="text-[.5rem] tracking-[.25em] text-bronzelight link-lux shrink-0"
                >
                  ADD
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="grid grid-cols-2 gap-3 mb-6" data-reveal>
          <ActionBtn disabled={busy} onClick={() => ping('waiter')} label="CALL WAITER" sub="Host notified" />
          <ActionBtn disabled={busy} onClick={() => ping('bill')} label="REQUEST BILL" sub="Closing the table" />
          <ActionBtn disabled={busy} onClick={() => ping('water')} label="WATER REFILL" sub="Fresh glass soon" />
          <ActionBtn disabled={busy} onClick={() => setFeedbackOpen(true)} label="FEEDBACK" sub="Instant note" />
        </section>

        {feedbackOpen && (
          <form
            onSubmit={onFeedback}
            className="border border-bronze/30 bg-coal p-6 mb-6 space-y-4"
            data-reveal
          >
            <p className="text-[.55rem] tracking-[.35em] text-bronze">LEAVE INSTANT FEEDBACK</p>
            <textarea
              name="note"
              rows={3}
              className="field resize-none"
              placeholder="Service, pour, ambience…"
              required
            />
            <div className="flex gap-3">
              <button type="submit" disabled={busy} className="btn-primary px-6 py-3 text-[.55rem] font-medium">
                SEND
              </button>
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className="btn-ghost px-6 py-3 text-[.55rem]"
              >
                CANCEL
              </button>
            </div>
          </form>
        )}

        <section className="grid sm:grid-cols-2 gap-3" data-reveal>
          <button
            disabled={busy}
            onClick={saveToPassport}
            className="btn-primary magnetic w-full py-4 text-[.58rem] font-medium"
          >
            SAVE TO DRIP PASSPORT
          </button>
          <button
            disabled={busy}
            onClick={shareMoment}
            className="btn-ghost magnetic w-full py-4 text-[.58rem]"
          >
            SHARE TO INSTAGRAM
          </button>
        </section>

        <p className="mt-8 text-center text-[.5rem] tracking-[.3em] text-cream/30">
          PHYSICAL TABLE · DIGITAL EXPERIENCE · {SITE.instagramHandle}
        </p>
      </div>
    </div>
  )
}

function ActionBtn({
  label,
  sub,
  onClick,
  disabled,
}: {
  label: string
  sub: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="text-left border border-cream/10 hover:border-bronze/40 bg-coal px-5 py-5 transition-colors"
      data-hover
    >
      <span className="block text-[.58rem] tracking-[.28em] text-cream">{label}</span>
      <span className="block mt-2 text-[.7rem] text-cream/40">{sub}</span>
    </button>
  )
}
