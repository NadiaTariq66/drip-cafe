import { SITE, INSTAGRAM_POSTS } from '../../data/content'

export function InstagramStrip() {
  return (
    <section className="relative py-28 lg:py-36 bg-ink">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="md:flex items-end justify-between gap-10 mb-14">
          <div>
            <p className="flex items-center gap-4 text-[.62rem] tracking-[.5em] text-bronze mb-6" data-reveal>
              <span className="eyebrow-line" /> FROM {SITE.instagramHandle.toUpperCase()}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl text-cream" data-split>
              Latest from the house
            </h2>
          </div>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost magnetic mt-6 md:mt-0 inline-block px-8 py-4 text-[.6rem]"
            data-reveal
          >
            OPEN INSTAGRAM
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INSTAGRAM_POSTS.map((post, i) => (
            <a
              key={post.id}
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer"
              className="lux-card group bg-soot border border-cream/10 rounded-sm overflow-hidden"
              data-reveal
              data-delay={String(i * 0.08)}
              data-hover
            >
              <div className="zoom-img h-64">
                <img src={post.image} alt={post.caption} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-6">
                <p className="text-[.55rem] tracking-[.35em] text-bronze mb-3">
                  INSTAGRAM · {post.ago.toUpperCase()}
                </p>
                <p className="text-cream/70 text-sm leading-relaxed line-clamp-3">{post.caption}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
