import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  displayName: string
}

export interface StoredUser {
  id: string
  email: string
  displayName: string
}

interface AuthState {
  user: User | null
  users: StoredUser[]
  loading: boolean
  initialize: () => void
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  addUser: (email: string, displayName: string, password: string) => Promise<{ ok: boolean; error?: string }>
  removeUser: (email: string) => Promise<void>
  changePassword: (email: string, newPassword: string) => Promise<void>
  changeDisplayName: (email: string, displayName: string) => Promise<void>
}

async function buildUser(authUser: SupabaseUser): Promise<{ user: User; users: StoredUser[] }> {
  const displayName =
    (authUser.user_metadata?.display_name as string | undefined) ??
    authUser.email?.split('@')[0] ??
    'User'

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .order('created_at')

  return {
    user: { id: authUser.id, email: authUser.email!, displayName },
    users: (profiles ?? []).map((p: { id: string; email: string; display_name: string }) => ({
      id: p.id,
      email: p.email,
      displayName: p.display_name,
    })),
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  users: [],
  loading: true,

  initialize: () => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { user, users } = await buildUser(session.user)
        set({ user, users, loading: false })
      } else {
        set({ loading: false })
      }
    })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { user, users } = await buildUser(session.user)
        set({ user, users, loading: false })
      } else {
        set({ user: null, users: [], loading: false })
      }
    })
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, users: [] })
  },

  addUser: async (email, displayName, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  removeUser: async (email) => {
    await supabase.from('profiles').delete().eq('email', email)
    set(s => ({ users: s.users.filter(u => u.email !== email) }))
  },

  changePassword: async (_email, newPassword) => {
    await supabase.auth.updateUser({ password: newPassword })
  },

  changeDisplayName: async (email, displayName) => {
    await supabase.from('profiles').update({ display_name: displayName }).eq('email', email)
    set(s => ({
      users: s.users.map(u => u.email === email ? { ...u, displayName } : u),
      user: s.user?.email === email ? { ...s.user, displayName } : s.user,
    }))
  },
}))
