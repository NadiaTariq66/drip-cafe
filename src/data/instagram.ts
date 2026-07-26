/** Live posts & reels from @drip.lhr — shown via official Instagram embeds. */
export const INSTAGRAM_FEED = [
  {
    id: 'ig1',
    permalink: 'https://www.instagram.com/drip.lhr/p/DbNoyraDjcN/',
    type: 'post' as const,
    caption: 'Latest from the house',
  },
  {
    id: 'ig2',
    permalink: 'https://www.instagram.com/drip.lhr/p/DbKucfwjl9h/',
    type: 'post' as const,
    caption: 'Fresh from the kitchen',
  },
  {
    id: 'ig3',
    permalink: 'https://www.instagram.com/drip.lhr/p/Da7Pa_6jn6l/',
    type: 'post' as const,
    caption: 'Weekend at Drip',
  },
  {
    id: 'ig4',
    permalink: 'https://www.instagram.com/drip.lhr/reel/Dazde-XMSMj/',
    type: 'reel' as const,
    caption: 'Reel — dine out energy',
  },
  {
    id: 'ig5',
    permalink: 'https://www.instagram.com/drip.lhr/p/Da2QXhoDskI/',
    type: 'post' as const,
    caption: 'Morning bake',
  },
  {
    id: 'ig6',
    permalink: 'https://www.instagram.com/drip.lhr/p/DaqrmBVOWRY/',
    type: 'post' as const,
    caption: 'Chicken katsu rice bowl',
  },
]

export function instagramEmbedUrl(permalink: string) {
  const base = permalink.replace(/\/$/, '')
  return `${base}/embed`
}
