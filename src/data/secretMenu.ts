export interface SecretItem {
  id: string
  name: string
  description: string
  price: number
  tag: string
}

export const SECRET_SUMMER_MENU: SecretItem[] = [
  {
    id: 's1',
    name: 'Gulberg Mist Cold Foam',
    description: 'Espresso over crushed ice, saffron cold foam, orange oils.',
    price: 1250,
    tag: 'SECRET Nº 01',
  },
  {
    id: 's2',
    name: 'Midnight Mango Affogato',
    description: 'House mango gelato drowned in a double ristretto.',
    price: 1450,
    tag: 'SECRET Nº 02',
  },
  {
    id: 's3',
    name: 'Chili Honey Cortado',
    description: 'Equal parts, finished with warm honey and a whisper of chili.',
    price: 950,
    tag: 'SECRET Nº 03',
  },
  {
    id: 's4',
    name: 'Rosewater Flat White',
    description: 'Velvet milk, single-origin espresso, edible rose.',
    price: 1100,
    tag: 'SECRET Nº 04',
  },
  {
    id: 's5',
    name: 'Black Sesame Shakerato',
    description: 'Shaken espresso, black sesame syrup, served up.',
    price: 1050,
    tag: 'SECRET Nº 05',
  },
]

export const SECRET_UNLOCK_KEY = 'drip-secret-summer-unlocked'
export const BEANS_NEEDED = 5
