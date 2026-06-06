import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuthStore } from '@/store/authStore'
import { UserPlus, KeyRound, Trash2, Pencil, Check, X } from 'lucide-react'

// ── Add user dialog ────────────────────────────────────────────────────────
function AddUserDialog() {
  const { addUser } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    setError(null)
    setLoading(true)
    const result = await addUser(email, displayName, password)
    setLoading(false)
    if (!result.ok) { setError(result.error ?? 'Hata'); return }
    setOpen(false)
    setEmail(''); setDisplayName(''); setPassword('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="h-4 w-4 mr-1" /> Kullanıcı Ekle</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Yeni Kullanıcı</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Display Name</Label>
            <Input placeholder="Ahmet" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" placeholder="ahmet@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Şifre</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" onClick={handleAdd} disabled={loading}>
            {loading ? 'Ekleniyor…' : 'Ekle'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Change password dialog ─────────────────────────────────────────────────
function ChangePasswordDialog({ email }: { email: string }) {
  const { changePassword } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleChange() {
    if (password.length < 4) { setError('En az 4 karakter giriniz.'); return }
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); return }
    await changePassword(email, password)
    setOpen(false)
    setPassword(''); setConfirm(''); setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Şifre değiştir">
          <KeyRound className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Şifre Değiştir</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{email}</p>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Yeni Şifre</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1">
            <Label>Tekrar</Label>
            <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChange()} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" onClick={handleChange}>Kaydet</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Inline display name editor ─────────────────────────────────────────────
function EditableName({ email, name }: { email: string; name: string }) {
  const { changeDisplayName } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(name)

  function commit() {
    if (val.trim()) changeDisplayName(email, val.trim())
    setEditing(false)
  }

  if (editing) return (
    <div className="flex items-center gap-1">
      <Input className="h-6 w-32 text-xs" value={val} autoFocus
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }} />
      <button onClick={commit} className="text-green-600"><Check className="h-3 w-3" /></button>
      <button onClick={() => setEditing(false)} className="text-muted-foreground"><X className="h-3 w-3" /></button>
    </div>
  )

  return (
    <div className="flex items-center gap-1 group">
      <span className="font-medium">{name}</span>
      <button onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity">
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export function UserManagementPage() {
  const { users, user: currentUser, removeUser } = useAuthStore()

  function handleRemove(email: string) {
    if (email === currentUser?.email) return
    if (!confirm(`"${email}" kullanıcısı silinsin mi?`)) return
    removeUser(email)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} kullanıcı kayıtlı</p>
        </div>
        <AddUserDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kullanıcılar</CardTitle>
          <CardDescription>İsim üzerine tıklayarak düzenleyebilirsin.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">İsim</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-right px-4 py-3 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <EditableName email={u.email} name={u.displayName} />
                      {u.email === currentUser?.email && (
                        <Badge variant="secondary" className="text-xs">Sen</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {u.email === currentUser?.email && <ChangePasswordDialog email={u.email} />}
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(u.email)}
                        disabled={u.email === currentUser?.email}
                        title={u.email === currentUser?.email ? 'Kendi hesabını silemezsin' : 'Sil'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
