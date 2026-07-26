import type { CoffeePersonality } from '../data/coffeePersonality'
import { SITE } from '../data/content'

const W = 1080
const H = 1920

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ')
  let line = ''
  let cy = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy)
      line = word
      cy += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, cy)
  return cy
}

export async function renderPersonalityCard(personality: CoffeePersonality): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')

  // Background
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#0d0b09')
  g.addColorStop(0.45, '#1a1410')
  g.addColorStop(1, '#2a1f16')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // Soft bronze glow
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.28, 40, W * 0.5, H * 0.28, 520)
  glow.addColorStop(0, 'rgba(183,138,82,0.28)')
  glow.addColorStop(1, 'rgba(183,138,82,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // Frame
  ctx.strokeStyle = 'rgba(183,138,82,0.45)'
  ctx.lineWidth = 2
  roundRect(ctx, 48, 48, W - 96, H - 96, 8)
  ctx.stroke()

  // Brand
  ctx.fillStyle = '#b78a52'
  ctx.font = '500 28px Jost, sans-serif'
  ctx.letterSpacing = '12px'
  ctx.textAlign = 'center'
  ctx.fillText('DRIP  ·  COFFEE PERSONALITY', W / 2, 140)

  ctx.fillStyle = 'rgba(241,231,215,0.45)'
  ctx.font = '300 22px Jost, sans-serif'
  ctx.letterSpacing = '8px'
  ctx.fillText('GULBERG  ·  LAHORE', W / 2, 185)

  // You are
  ctx.fillStyle = 'rgba(241,231,215,0.55)'
  ctx.font = 'italic 42px "Cormorant Garamond", serif'
  ctx.letterSpacing = '2px'
  ctx.fillText('You are', W / 2, 420)

  // Emoji
  ctx.font = '120px serif'
  ctx.fillText(personality.emoji, W / 2, 560)

  // Title
  ctx.fillStyle = '#f1e7d7'
  ctx.font = '500 78px "Cormorant Garamond", serif'
  ctx.letterSpacing = '0px'
  const titleY = wrapText(ctx, personality.title, W / 2, 680, W - 200, 88)

  // Tagline
  ctx.fillStyle = '#d9b382'
  ctx.font = 'italic 40px "Pinyon Script", cursive'
  ctx.fillText(personality.tagline, W / 2, titleY + 70)

  // Divider
  ctx.strokeStyle = 'rgba(183,138,82,0.35)'
  ctx.beginPath()
  ctx.moveTo(W * 0.28, titleY + 120)
  ctx.lineTo(W * 0.72, titleY + 120)
  ctx.stroke()

  // Blurb
  ctx.fillStyle = 'rgba(241,231,215,0.72)'
  ctx.font = '300 32px Jost, sans-serif'
  wrapText(ctx, personality.blurb, W / 2, titleY + 190, W - 220, 48)

  // Traits
  let ty = H - 520
  ctx.fillStyle = '#b78a52'
  ctx.font = '500 22px Jost, sans-serif'
  ctx.letterSpacing = '6px'
  ctx.fillText('YOUR RITUAL TRAITS', W / 2, ty)
  ty += 60
  ctx.fillStyle = '#f1e7d7'
  ctx.font = '400 30px "Cormorant Garamond", serif'
  ctx.letterSpacing = '1px'
  for (const trait of personality.traits) {
    ctx.fillText(`◆  ${trait}`, W / 2, ty)
    ty += 48
  }

  // Footer CTA
  ctx.fillStyle = 'rgba(183,138,82,0.9)'
  ctx.font = '500 24px Jost, sans-serif'
  ctx.letterSpacing = '4px'
  ctx.fillText('FIND YOUR POUR AT DRIP', W / 2, H - 220)

  ctx.fillStyle = 'rgba(241,231,215,0.5)'
  ctx.font = '300 22px Jost, sans-serif'
  ctx.letterSpacing = '3px'
  ctx.fillText(`${SITE.instagramHandle}  ·  drip.cafe/personality`, W / 2, H - 165)

  return canvas
}

export async function downloadPersonalityStory(personality: CoffeePersonality) {
  const canvas = await renderPersonalityCard(personality)
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `drip-${personality.id}-story.png`
  a.click()
}

export function personalityShareText(personality: CoffeePersonality) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/personality` : 'https://drip.cafe/personality'
  return `${personality.linkedinHook}\n\n${personality.emoji} ${personality.tagline}\n\nTake the Drip Coffee Personality quiz → ${url}\n${SITE.instagramHandle}`
}

export function linkedInShareUrl(personality: CoffeePersonality) {
  const page = typeof window !== 'undefined' ? `${window.location.origin}/personality?r=${personality.id}` : ''
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(page)}`
}
