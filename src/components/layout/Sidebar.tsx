import { cn } from "@/lib/utils"
import {
  BarChart3,
  Upload,
  Search,
  BookOpen,
  TrendingUp,
  Gem,
  Palette,
  Sword,
} from "lucide-react"

export type Page =
  | 'dashboard'
  | 'auction-import'
  | 'item-prices'
  | 'recipes'
  | 'profession-leveling'
  | 'prospecting'
  | 'theme-settings'

const NAV_ITEMS: { id: Page; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'auction-import', label: 'Auction Import', icon: Upload },
  { id: 'item-prices', label: 'Item Prices', icon: Search },
  { id: 'recipes', label: 'Recipes', icon: BookOpen },
  { id: 'profession-leveling', label: 'Prof. Leveling', icon: TrendingUp },
  { id: 'prospecting', label: 'Prospecting', icon: Gem },
  { id: 'theme-settings', label: 'Theme Settings', icon: Palette },
]

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 border-r bg-card flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-4 py-5 border-b">
        <Sword className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">WoW Auction</span>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              activePage === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-3 border-t text-xs text-muted-foreground">
        TBC/Classic Analyzer
      </div>
    </aside>
  )
}
