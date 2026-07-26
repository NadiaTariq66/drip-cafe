import { SITE } from '../../data/content'
import { INSTAGRAM_FEED } from '../../data/instagram'
import { InstagramEmbed } from '../ui/InstagramEmbed'

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
              Live from Instagram
            </h2>
            <p className="mt-4 max-w-md text-cream/50 text-sm leading-relaxed" data-reveal>
              Real posts and reels from {SITE.instagramHandle} — embedded straight from Instagram.
            </p>
          </div>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost magnetic mt-6 md:mt-0 inline-block px-8 py-4 text-[.62rem]"
            data-reveal
          >
            OPEN INSTAGRAM
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INSTAGRAM_FEED.map((post, i) => (
            <div key={post.id} data-reveal data-delay={String(i * 0.06)} data-hover>
              <p className="text-[.55rem] tracking-[.35em] text-bronze mb-3">
                {post.type === 'reel' ? 'REEL' : 'POST'} · {SITE.instagramHandle.toUpperCase()}
              </p>
              <InstagramEmbed permalink={post.permalink} caption={post.caption} />
              <a
                href={post.permalink}
                target="_blank"
                rel="noreferrer"
                className="link-lux inline-block mt-3 text-[.55rem] tracking-[.25em] text-cream/45"
              >
                OPEN ON INSTAGRAM
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
