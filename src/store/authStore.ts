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

// SHA-256 via Web Crypto API
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
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
