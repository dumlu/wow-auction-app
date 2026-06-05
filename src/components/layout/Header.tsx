import { Moon, Sun, Database, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuctionStore } from "@/store/auctionStore"
import { useAuthStore } from "@/store/authStore"

interface HeaderProps {
  isDark: boolean
  onToggleDark: () => void
}

export function Header({ isDark, onToggleDark }: HeaderProps) {
  const { sessions, useDemoData } = useAuctionStore()
  const { user, logout } = useAuthStore()
  const lastSession = sessions[sessions.length - 1]

  return (
    <header className="border-b bg-card px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Database className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {lastSession ? (
            <>
              <span className="font-medium text-foreground">{lastSession.realm ?? 'Unknown Realm'}</span>
              <span>·</span>
              <span>{lastSession.entryCount} entries</span>
              <span>·</span>
              <span>{new Date(lastSession.importDate).toLocaleDateString()}</span>
            </>
          ) : (
            <span>No data imported</span>
          )}
          {useDemoData && <Badge variant="secondary">Demo Data</Badge>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user.displayName}
          </span>
        )}
        <Button variant="ghost" size="icon" onClick={onToggleDark}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        {user && (
          <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  )
}
