export type WeatherMood = 'rain' | 'heat' | 'winter' | 'night' | 'mild'

export interface WeatherReading {
  mood: WeatherMood
  label: string
  emoji: string
  tempC: number | null
  condition: string
  recommendation: {
    drink: string
    blurb: string
  }
  gradient: string
  accent: string
}

const LAHORE = { lat: 31.5204, lon: 74.3587 }

const RECS: Record<WeatherMood, WeatherReading['recommendation']> = {
  rain: {
    drink: 'Hot Mocha',
    blurb: 'Rain on the boulevard — cocoa and espresso, held in both hands.',
  },
  heat: {
    drink: 'Iced Latte',
    blurb: 'The city is loud with heat. Stay cool. Stay clear.',
  },
  winter: {
    drink: 'Hot Chocolate',
    blurb: 'Cold air, warm cup. Winter etiquette at DRIP.',
  },
  night: {
    drink: 'Tiramisu Latte',
    blurb: 'After dark, dessert is a decision — not a compromise.',
  },
  mild: {
    drink: 'Spanish Latte',
    blurb: 'Soft light, soft pour. Gulberg’s favourite middle path.',
  },
}

const GRADIENTS: Record<WeatherMood, { gradient: string; accent: string; emoji: string; label: string }> = {
  rain: {
    gradient: 'from-[#0d1520] via-[#14110e] to-[#1a2230]',
    accent: '#7aa0c4',
    emoji: '🌧',
    label: 'Rain',
  },
  heat: {
    gradient: 'from-[#2a1608] via-[#1a100c] to-[#3a220f]',
    accent: '#e0a35a',
    emoji: '☀',
    label: 'Heat',
  },
  winter: {
    gradient: 'from-[#101820] via-[#14110e] to-[#1c2834]',
    accent: '#a8c0d4',
    emoji: '❄',
    label: 'Winter',
  },
  night: {
    gradient: 'from-[#0a0812] via-[#141018] to-[#1a1220]',
    accent: '#c4a0d4',
    emoji: '🌙',
    label: 'Night',
  },
  mild: {
    gradient: 'from-ink via-coal to-walnut',
    accent: '#b78a52',
    emoji: '🌤',
    label: 'Mild',
  },
}

function classify(tempC: number | null, weatherCode: number | null, hour: number): WeatherMood {
  if (hour >= 20 || hour < 6) return 'night'
  if (weatherCode != null && weatherCode >= 51 && weatherCode <= 67) return 'rain'
  if (weatherCode != null && (weatherCode >= 80 && weatherCode <= 82)) return 'rain'
  if (tempC != null && tempC >= 36) return 'heat'
  if (tempC != null && tempC <= 16) return 'winter'
  return 'mild'
}

function buildReading(mood: WeatherMood, tempC: number | null, condition: string): WeatherReading {
  const g = GRADIENTS[mood]
  return {
    mood,
    label: mood === 'heat' && tempC != null ? `${tempC}°` : g.label,
    emoji: g.emoji,
    tempC,
    condition,
    recommendation: RECS[mood],
    gradient: g.gradient,
    accent: g.accent,
  }
}

/** Offline / API-fail fallback using local clock + Lahore season heuristic */
export function fallbackWeather(): WeatherReading {
  const now = new Date()
  const hour = now.getHours()
  const month = now.getMonth() + 1
  let mood: WeatherMood = 'mild'
  let temp: number | null = 28
  let condition = 'Clear skies over Gulberg'

  if (hour >= 20 || hour < 6) {
    mood = 'night'
    condition = 'Night over Main Boulevard'
  } else if (month >= 12 || month <= 2) {
    mood = 'winter'
    temp = 14
    condition = 'Winter air in Lahore'
  } else if (month >= 5 && month <= 8 && hour >= 11 && hour <= 17) {
    mood = 'heat'
    temp = 42
    condition = 'Peak afternoon heat'
  }

  return buildReading(mood, temp, condition)
}

export async function detectWeather(): Promise<WeatherReading> {
  try {
    let { lat, lon } = LAHORE
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 4000,
            maximumAge: 600000,
          })
        })
        lat = pos.coords.latitude
        lon = pos.coords.longitude
      } catch {
        /* keep Lahore */
      }
    }

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code,is_day&timezone=auto`

    const res = await fetch(url)
    if (!res.ok) return fallbackWeather()
    const data = await res.json()
    const tempC = data.current?.temperature_2m ?? null
    const code = data.current?.weather_code ?? null
    const isDay = data.current?.is_day === 1
    const hour = isDay ? new Date().getHours() : 22
    const mood = classify(tempC, code, !isDay ? 22 : hour)
    const condition =
      mood === 'rain'
        ? 'Rain nearby'
        : mood === 'heat'
          ? 'Hot and bright'
          : mood === 'winter'
            ? 'Cool air'
            : mood === 'night'
              ? 'After hours'
              : 'Pleasant conditions'
    return buildReading(mood, tempC, condition)
  } catch {
    return fallbackWeather()
  }
}
