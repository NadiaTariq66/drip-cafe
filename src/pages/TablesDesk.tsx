import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CAFE_TABLES, qrImageUrl, tableUrl, ORDER_STATUS_LABEL, type TableRequest, type TableSession } from '../data/tables'
import {
  ackRequest,
  isSupabaseConfigured,
  listActiveSessions,
  listOpenRequests,
  setOrderStatus,
  subscribeTables,
} from '../lib/tableApi'
import { useReveal } from '../hooks/useReveal'

export function TablesDesk() {
  const [sessions, setSessions] = useState<TableSession[]>([])
  const [requests, setRequests] = useState<TableRequest[]>([])
  const [selected, setSelected] = useState('G12')

  const refresh = useCallback(async () => {
    const [s, r] = await Promise.all([listActiveSessions(), listOpenRequests()])
    setSessions(s)
    setRequests(r)
  }, [])

  useEffect(() => {
    document.title = 'Table Desk — DRIP'
    refresh()
    return subscribeTables(() => {
      void refresh()
    })
  }, [refresh])

  useReveal([sessions.length, requests.length, selected])

  const selectedUrl = tableUrl(selected)
  const sessionFor = (code: string) => sessions.find((s) => s.table_code === code)

  return (
    <div className="pt-36 pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
              <span className="eyebrow-line" /> STAFF · PHYSICAL × DIGITAL
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-cream" data-split>
              Digital Coffee Table
            </h1>
            <p className="mt-4 text-cream/50 max-w-xl" data-reveal>
              Print a QR for every table. Guests scan into a live session — order status, pairings,
              waiter, bill, water, feedback, passport, and Instagram share.
            </p>
          </div>
          <span
            className={`text-[.55rem] tracking-[.3em] px-4 py-2 border ${
              isSupabaseConfigured
                ? 'border-emerald-500/40 text-emerald-400/90'
                : 'border-bronze/40 text-bronzelight'
            }`}
            data-reveal
          >
            {isSupabaseConfigured ? 'SUPABASE LIVE' : 'LOCAL DEMO'}
          </span>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-10 mb-14">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4" data-reveal>
            {CAFE_TABLES.map((t) => {
              const s = sessionFor(t.code)
              const active = selected === t.code
              return (
                <button
                  key={t.code}
                  onClick={() => setSelected(t.code)}
                  className={`text-left border p-5 transition-colors ${
                    active ? 'border-bronze bg-bronze/10' : 'border-cream/10 bg-coal hover:border-bronze/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-serif text-2xl text-cream">{t.code}</p>
                    <Link
                      to={`/table/${t.code}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[.45rem] tracking-[.2em] text-bronzelight"
                    >
                      OPEN
                    </Link>
                  </div>
                  <p className="text-[.55rem] tracking-[.25em] text-cream/40 mt-1">
                    {t.zone.toUpperCase()}
                  </p>
                  <p className="mt-4 text-sm text-cream/70">
                    {s?.current_drink || 'Empty'}
                    {s?.current_item ? ` · ${s.current_item}` : ''}
                  </p>
                  <p className="mt-1 text-[.55rem] tracking-[.2em] text-bronze">
                    {s ? ORDER_STATUS_LABEL[s.order_status] : 'No session'}
                  </p>
                  {s && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(['brewing', 'on_the_way', 'served'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={(e) => {
                            e.stopPropagation()
                            void setOrderStatus(s.id, st).then(refresh)
                          }}
                          className="text-[.4rem] tracking-[.15em] border border-cream/15 px-2 py-1 text-cream/50 hover:border-bronze/40"
                        >
                          {st.replaceAll('_', ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="border border-bronze/30 bg-coal p-6 text-center" data-reveal>
            <p className="text-[.55rem] tracking-[.35em] text-bronze mb-4">PRINT THIS QR</p>
            <p className="font-serif text-3xl text-cream mb-4">Table {selected}</p>
            <img
              src={qrImageUrl(selectedUrl, 280)}
              alt={`QR for table ${selected}`}
              className="mx-auto w-56 h-56 border border-cream/10"
            />
            <p className="mt-4 text-[.55rem] tracking-[.2em] text-cream/40 break-all px-2">
              {selectedUrl}
            </p>
            <a
              href={selectedUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost inline-block mt-6 px-6 py-3 text-[.55rem]"
            >
              PREVIEW GUEST VIEW
            </a>
          </div>
        </div>

        <section data-reveal>
          <p className="text-[.55rem] tracking-[.4em] text-bronze mb-6">LIVE TABLE REQUESTS</p>
          {requests.length === 0 && (
            <p className="text-cream/40 text-sm">Quiet floor — no open requests.</p>
          )}
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="border border-cream/10 bg-soot px-5 py-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="text-[.5rem] tracking-[.3em] text-bronze">
                    TABLE {r.table_code} · {r.kind.toUpperCase()}
                  </p>
                  <p className="font-serif text-xl text-cream mt-1">
                    {r.message || r.kind.replace('_', ' ')}
                  </p>
                  <p className="text-[.55rem] text-cream/35 mt-1">
                    {new Date(r.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => void ackRequest(r.id).then(refresh)}
                  className="btn-primary px-5 py-2 text-[.5rem] font-medium"
                >
                  ACK
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
