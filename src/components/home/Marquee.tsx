const items = [
  'SINGLE ORIGIN',
  'SPANISH LATTE',
  'WOOD FIRED BAKERY',
  '48-HOUR SOURDOUGH',
  'GULBERG · DHA · ADDA',
  'OPEN TILL 1 AM',
]

export function Marquee() {
  return (
    <div className="relative border-y border-bronze/15 bg-coal py-5 overflow-hidden">
      <div className="marquee-track text-[.65rem] tracking-[.45em] text-cream/55">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center shrink-0" aria-hidden={copy === 1}>
            {items.map((item) => (
              <span key={`${copy}-${item}`} className="contents">
                <span className="mx-8">{item}</span>
                <span className="text-bronze">◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
