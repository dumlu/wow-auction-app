import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  email: string
  displayName: string
}

interface AuthState {
  user: User | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

// SHA-256 — works on both HTTP and HTTPS
async function sha256(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback: pure-JS SHA-256 (HTTP / non-secure context)
  return sha256Fallback(text)
}

function sha256Fallback(str: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount))
  }
  const mathPow = Math.pow
  const maxWord = mathPow(2, 32)
  const lengthProperty = 'length'
  let i, j, result = ''
  const words: number[] = []
  const asciiBitLength = str[lengthProperty] * 8
  let hash = [] as number[]
  const k: number[] = []
  let primeCounter = k[lengthProperty]
  const isComposite: Record<number, boolean> = {}
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = true
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0
    }
  }
  str += '\x80'
  while ((str[lengthProperty] % 64) - 56) str += '\x00'
  for (i = 0; i < str[lengthProperty]; i++) {
    j = str.charCodeAt(i)
    if (j >> 8) return ''
    words[i >> 2] |= j << (((3 - i) % 4) * 8)
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0
  words[words[lengthProperty]] = asciiBitLength
  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, (j += 16))
    const oldHash = [...hash]
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2]
      const a = hash[0], e = hash[4]
      const temp1 = hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) + k[i] +
        (w[i] = i < 16 ? w[i] : (
          w[i - 16] +
          (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
          w[i - 7] +
          (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
        ) | 0)
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]))
      hash = [(temp1 + temp2) | 0, ...hash]
      hash[4] = (hash[4] + temp1) | 0
      hash.length = 8
    }
    hash = hash.map((h, i) => (h + oldHash[i]) | 0)
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255
      result += (b < 16 ? '0' : '') + b.toString(16)
    }
  }
  return result
}

// Registered users: email → { hash, displayName }
const USERS: Record<string, { hash: string; displayName: string }> = {
  'muratdumlu@gmail.com': {
    hash: '6af9f93b3b6d3de09ba7e65f547a013d681ed905aadfca4d0ea6bb2a122c9d61',
    displayName: 'Murat',
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      login: async (email, password) => {
        const record = USERS[email.toLowerCase().trim()]
        if (!record) return { ok: false, error: 'Invalid email or password.' }
        const hash = await sha256(password)
        if (hash !== record.hash) return { ok: false, error: 'Invalid email or password.' }
        set({ user: { email: email.toLowerCase().trim(), displayName: record.displayName } })
        return { ok: true }
      },

      logout: () => set({ user: null }),
    }),
    { name: 'wow-auction-auth' }
  )
)
