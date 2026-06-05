import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  email: string
  displayName: string
}

export interface StoredUser {
  email: string
  displayName: string
  hash: string
}

interface AuthState {
  user: User | null
  users: StoredUser[]
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  addUser: (email: string, displayName: string, password: string) => Promise<{ ok: boolean; error?: string }>
  removeUser: (email: string) => void
  changePassword: (email: string, newPassword: string) => Promise<void>
  changeDisplayName: (email: string, displayName: string) => void
}

// SHA-256 — works on both HTTP and HTTPS
export async function sha256(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  }
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

const SEED_USER: StoredUser = {
  email: 'muratdumlu@gmail.com',
  displayName: 'Murat',
  hash: '6af9f93b3b6d3de09ba7e65f547a013d681ed905aadfca4d0ea6bb2a122c9d61',
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [SEED_USER],

      login: async (email, password) => {
        const record = get().users.find(u => u.email === email.toLowerCase().trim())
        if (!record) return { ok: false, error: 'Invalid email or password.' }
        const hash = await sha256(password)
        if (hash !== record.hash) return { ok: false, error: 'Invalid email or password.' }
        set({ user: { email: record.email, displayName: record.displayName } })
        return { ok: true }
      },

      logout: () => set({ user: null }),

      addUser: async (email, displayName, password) => {
        const key = email.toLowerCase().trim()
        if (!key || !displayName.trim() || !password) return { ok: false, error: 'Tüm alanlar zorunlu.' }
        if (get().users.find(u => u.email === key)) return { ok: false, error: 'Bu email zaten kayıtlı.' }
        const hash = await sha256(password)
        set(s => ({ users: [...s.users, { email: key, displayName: displayName.trim(), hash }] }))
        return { ok: true }
      },

      removeUser: (email) => {
        set(s => ({ users: s.users.filter(u => u.email !== email) }))
      },

      changePassword: async (email, newPassword) => {
        const hash = await sha256(newPassword)
        set(s => ({ users: s.users.map(u => u.email === email ? { ...u, hash } : u) }))
      },

      changeDisplayName: (email, displayName) => {
        set(s => ({
          users: s.users.map(u => u.email === email ? { ...u, displayName } : u),
          user: s.user?.email === email ? { ...s.user, displayName } : s.user,
        }))
      },
    }),
    {
      name: 'wow-auction-auth',
      // Seed user'ı her zaman garantile
      onRehydrateStorage: () => (state) => {
        if (state && !state.users.find(u => u.email === SEED_USER.email)) {
          state.users = [SEED_USER, ...state.users]
        }
      },
    }
  )
)
