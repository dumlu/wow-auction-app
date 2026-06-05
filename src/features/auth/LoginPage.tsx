import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sword, Moon, Sun } from 'lucide-react'

interface LoginPageProps {
  isDark: boolean
  onToggleDark: () => void
}

export function LoginPage({ isDark, onToggleDark }: LoginPageProps) {
  const login = useAuthStore(s => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setError(null)
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (!result.ok) setError(result.error ?? 'Login failed.')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <button
        onClick={onToggleDark}
        className="absolute top-4 right-4 p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-2">
            <Sword className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">WoW Auction</h1>
          <p className="text-sm text-muted-foreground">TBC / Classic Analyzer</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null) }}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null) }}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading || !email || !password}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Build: {new Date(__BUILD_DATE__).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      </div>
    </div>
  )
}
