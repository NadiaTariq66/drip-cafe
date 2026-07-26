type Props = {
  label: string
  location: string
  date: string
  ink: string
  index: number
  empty?: boolean
}

export function StampSeal({ label, location, date, ink, index, empty }: Props) {
  if (empty) {
    return (
      <div className="passport-slot aspect-square border border-dashed border-cream/15 rounded-sm flex items-center justify-center">
        <span className="text-[.45rem] tracking-[.35em] text-cream/20">EMPTY</span>
      </div>
    )
  }

  const rotate = ((index * 17) % 14) - 7

  return (
    <div
      className="passport-stamp aspect-square relative flex items-center justify-center"
      style={{ ['--ink' as string]: ink }}
      data-stamp-index={index}
    >
      <div
        className="stamp-seal w-[88%] h-[88%] rounded-full border-[3px] border-double flex flex-col items-center justify-center text-center px-2"
        style={{
          borderColor: ink,
          color: ink,
          transform: `rotate(${rotate}deg)`,
          boxShadow: `inset 0 0 0 1px ${ink}55`,
        }}
      >
        <p className="text-[.4rem] tracking-[.35em] uppercase opacity-80">DRIP</p>
        <p className="font-serif text-[.7rem] leading-tight mt-1 px-1">{label}</p>
        <p className="text-[.38rem] tracking-[.2em] mt-1 uppercase opacity-75">{location}</p>
        <p className="text-[.35rem] tracking-[.15em] mt-0.5 opacity-60">
          {new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
          })}
        </p>
        <svg className="absolute inset-[12%] opacity-20 pointer-events-none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
        </svg>
      </div>
    </div>
  )
}
