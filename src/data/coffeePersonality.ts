export type PersonalityId =
  | 'spanish_latte'
  | 'cortado'
  | 'matcha'
  | 'tiramisu'
  | 'iced_latte'
  | 'espresso_tonic'
  | 'pistachio'
  | 'midnight_mocha'

export type QuestionId =
  | 'morning'
  | 'sweet'
  | 'strong'
  | 'reading'
  | 'coding'
  | 'meeting'
  | 'late_night'
  | 'dessert'

export type Answers = Record<QuestionId, boolean | null>

export interface QuizQuestion {
  id: QuestionId
  prompt: string
  yesLabel: string
  noLabel: string
}

export interface CoffeePersonality {
  id: PersonalityId
  title: string
  drink: string
  emoji: string
  tagline: string
  blurb: string
  traits: string[]
  linkedinHook: string
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'morning',
    prompt: 'Morning person?',
    yesLabel: 'Sunrise rituals',
    noLabel: 'Slow to wake',
  },
  {
    id: 'sweet',
    prompt: 'Sweet?',
    yesLabel: 'A little sugar, always',
    noLabel: 'Keep it clean',
  },
  {
    id: 'strong',
    prompt: 'Strong?',
    yesLabel: 'I want the punch',
    noLabel: 'Soft and steady',
  },
  {
    id: 'reading',
    prompt: 'Reading?',
    yesLabel: 'Book in hand',
    noLabel: 'Not today',
  },
  {
    id: 'coding',
    prompt: 'Coding?',
    yesLabel: 'Deep work mode',
    noLabel: 'Not my stack',
  },
  {
    id: 'meeting',
    prompt: 'Meeting?',
    yesLabel: 'Calls & catch-ups',
    noLabel: 'Protect the calendar',
  },
  {
    id: 'late_night',
    prompt: 'Late night?',
    yesLabel: 'City after dark',
    noLabel: 'Early lights out',
  },
  {
    id: 'dessert',
    prompt: 'Dessert?',
    yesLabel: 'Always room',
    noLabel: 'Savoury soul',
  },
]

export const PERSONALITIES: CoffeePersonality[] = [
  {
    id: 'spanish_latte',
    title: 'The Spanish Latte Person',
    drink: 'Spanish Latte',
    emoji: '☕',
    tagline: 'Soft power. Sweet focus.',
    blurb:
      'You move through the day with warmth — never rushed, never bitter. People borrow your calm and order what you’re having.',
    traits: ['Morning light', 'Gentle sweetness', 'Main character energy'],
    linkedinHook: 'Turns out I’m The Spanish Latte Person. Soft power. Sweet focus.',
  },
  {
    id: 'cortado',
    title: 'The Cortado Person',
    drink: 'Cortado',
    emoji: '⚡',
    tagline: 'Equal parts clarity and heat.',
    blurb:
      'You don’t do fluff. Short meetings, sharp code, clean finishes. Your coffee is a decision — not a decoration.',
    traits: ['Strong & balanced', 'Deep work', 'No wasted motion'],
    linkedinHook: 'Personality test says I’m The Cortado Person. Equal parts clarity and heat.',
  },
  {
    id: 'matcha',
    title: 'The Matcha Person',
    drink: 'Matcha Latte',
    emoji: '🌿',
    tagline: 'Quiet pages. Steady green.',
    blurb:
      'You choose stillness on purpose. Books over noise, rituals over rush. Your table always looks like a pause worth taking.',
    traits: ['Reader', 'Soft focus', 'Unhurried'],
    linkedinHook: 'I’m The Matcha Person — quiet pages, steady green. What’s your coffee personality?',
  },
  {
    id: 'tiramisu',
    title: 'The Tiramisu Latte Person',
    drink: 'Tiramisu Latte',
    emoji: '🍮',
    tagline: 'Dessert first. Always.',
    blurb:
      'You treat joy as non-negotiable. Late nights, sweet finishes, and a soft laugh that makes the room stay longer.',
    traits: ['Dessert soul', 'Night owl', 'Celebrate often'],
    linkedinHook: 'I’m The Tiramisu Latte Person. Dessert first. Always.',
  },
  {
    id: 'iced_latte',
    title: 'The Iced Latte Person',
    drink: 'Iced Latte',
    emoji: '🧊',
    tagline: 'Cool under pressure.',
    blurb:
      'Back-to-back meetings? You’re fine. You keep it chilled, charming, and somehow still get everything done.',
    traits: ['Social', 'Cool-headed', 'Always on'],
    linkedinHook: 'Coffee personality: The Iced Latte Person. Cool under pressure.',
  },
  {
    id: 'espresso_tonic',
    title: 'The Espresso Tonic Person',
    drink: 'Espresso Tonic',
    emoji: '✦',
    tagline: 'Bright ideas after dark.',
    blurb:
      'You’re the spark in the late session — unexpected, electric, a little theatrical. People remember your takes.',
    traits: ['Late nights', 'Bold twists', 'Creative voltage'],
    linkedinHook: 'I’m The Espresso Tonic Person — bright ideas after dark.',
  },
  {
    id: 'pistachio',
    title: 'The Pistachio Latte Person',
    drink: 'Pistachio Latte',
    emoji: '💚',
    tagline: 'Tasteful. A little unexpected.',
    blurb:
      'You have range — soft when it matters, distinctive when it counts. Your order is a signature, not a default.',
    traits: ['Refined', 'Curious palate', 'Quiet flex'],
    linkedinHook: 'I’m The Pistachio Latte Person. Tasteful. A little unexpected.',
  },
  {
    id: 'midnight_mocha',
    title: 'The Midnight Mocha Person',
    drink: 'Midnight Mocha',
    emoji: '🌙',
    tagline: 'Cocoa, caffeine, after hours.',
    blurb:
      'You bloom when the city slows. Strong, sweet, cinematic — your best work (and best dessert) happens after dinner.',
    traits: ['Night creative', 'Chocolate lean', 'Atmosphere first'],
    linkedinHook: 'I’m The Midnight Mocha Person. Cocoa, caffeine, after hours.',
  },
]

/** Weighted scoring from yes/no answers → personality */
export function scorePersonality(answers: Answers): CoffeePersonality {
  const scores: Record<PersonalityId, number> = {
    spanish_latte: 0,
    cortado: 0,
    matcha: 0,
    tiramisu: 0,
    iced_latte: 0,
    espresso_tonic: 0,
    pistachio: 0,
    midnight_mocha: 0,
  }

  const yes = (id: QuestionId) => answers[id] === true
  const no = (id: QuestionId) => answers[id] === false

  if (yes('morning')) {
    scores.spanish_latte += 3
    scores.pistachio += 2
    scores.matcha += 1
  } else {
    scores.tiramisu += 2
    scores.midnight_mocha += 2
    scores.espresso_tonic += 1
  }

  if (yes('sweet')) {
    scores.spanish_latte += 3
    scores.tiramisu += 3
    scores.pistachio += 2
    scores.midnight_mocha += 2
  } else {
    scores.cortado += 3
    scores.espresso_tonic += 2
    scores.matcha += 1
  }

  if (yes('strong')) {
    scores.cortado += 3
    scores.espresso_tonic += 2
    scores.midnight_mocha += 2
  } else {
    scores.spanish_latte += 2
    scores.matcha += 2
    scores.iced_latte += 1
  }

  if (yes('reading')) {
    scores.matcha += 4
    scores.pistachio += 1
    scores.spanish_latte += 1
  }

  if (yes('coding')) {
    scores.cortado += 4
    scores.espresso_tonic += 2
    scores.iced_latte += 1
  }

  if (yes('meeting')) {
    scores.iced_latte += 4
    scores.spanish_latte += 1
    scores.pistachio += 1
  }

  if (yes('late_night')) {
    scores.espresso_tonic += 3
    scores.midnight_mocha += 3
    scores.tiramisu += 2
  } else if (no('late_night')) {
    scores.spanish_latte += 1
    scores.matcha += 1
  }

  if (yes('dessert')) {
    scores.tiramisu += 4
    scores.midnight_mocha += 3
    scores.spanish_latte += 1
  } else {
    scores.cortado += 1
    scores.matcha += 1
  }

  // Classic Gulberg favourite bias when soft + sweet + morning
  if (yes('morning') && yes('sweet') && no('strong')) {
    scores.spanish_latte += 2
  }

  let best = PERSONALITIES[0]
  let bestScore = -1
  for (const p of PERSONALITIES) {
    if (scores[p.id] > bestScore) {
      bestScore = scores[p.id]
      best = p
    }
  }
  return best
}

export function emptyAnswers(): Answers {
  return {
    morning: null,
    sweet: null,
    strong: null,
    reading: null,
    coding: null,
    meeting: null,
    late_night: null,
    dessert: null,
  }
}

export const QUIZ_SHARE_PATH = '/personality'
