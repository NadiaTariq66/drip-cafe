import { useEffect } from 'react'
import { GALLERY, SITE } from '../data/content'
import { useReveal } from '../hooks/useReveal'

export function Gallery() {
  useReveal([])
  useEffect(() => {
    document.title = 'Gallery — DRIP Gulberg'
  }, [])

  const cols = [
    GALLERY.filter((_, i) => i % 3 === 0),
    GALLERY.filter((_, i) => i % 3 === 1),
    GALLERY.filter((_, i) => i % 3 === 2),
  ]

  return (
    <div className="pt-36 pb-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="md:flex items-end justify-between gap-10 mb-16">
          <div>
            <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
              <span className="eyebrow-line" /> GALLERY
            </p>
            <h1 className="font-serif text-6xl md:text-8xl text-cream" data-split>
              Rooms of warm light
            </h1>
          </div>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost magnetic mt-6 md:mt-0 inline-block px-8 py-4 text-[.6rem]"
            data-reveal
          >
            MORE ON {SITE.instagramHandle.toUpperCase()}
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {cols.map((col, ci) => (
            <div
              key={ci}
              className={`space-y-4 md:space-y-6 ${ci === 1 ? 'md:pt-16' : ''} ${ci === 2 ? 'md:pt-32 col-span-2 md:col-span-1' : ''}`}
            >
              {col.map((img) => (
                <div
                  key={img.id}
                  className="zoom-img zoom-hover group relative rounded-sm overflow-hidden"
                  data-reveal
                  data-hover
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    className={`w-full object-cover ${img.height}`}
                    loading="lazy"
                  />
                  <span className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5 text-[.6rem] tracking-[.35em] text-cream">
                    {img.label}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
