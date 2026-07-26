type Props = {
  permalink: string
  caption?: string
  className?: string
}

/** Official Instagram embed iframe — loads live posts/reels from @drip.lhr. */
export function InstagramEmbed({ permalink, caption, className = '' }: Props) {
  const src = `${permalink.replace(/\/$/, '')}/embed`
  return (
    <div className={`bg-soot border border-cream/10 overflow-hidden ${className}`}>
      <iframe
        src={src}
        title={caption || 'Instagram post from @drip.lhr'}
        className="w-full border-0 bg-ink"
        style={{ minHeight: 480, maxHeight: 720 }}
        loading="lazy"
        allow="encrypted-media; clipboard-write"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}
