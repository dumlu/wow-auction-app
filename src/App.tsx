import { useState, useEffect } from "react"
import { Sidebar, type Page } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { AuctionImportPage } from "@/features/auction-import/AuctionImportPage"
import { ItemPricesPage } from "@/features/item-prices/ItemPricesPage"
import { RecipesPage } from "@/features/recipes/RecipesPage"
import { ProfessionLevelingPage } from "@/features/profession-leveling/ProfessionLevelingPage"
import { ProspectingPage } from "@/features/prospecting/ProspectingPage"
import { ThemeSettingsPage } from "@/features/theme-settings/ThemeSettingsPage"
import { LoginPage } from "@/features/auth/LoginPage"
import { UserManagementPage } from "@/features/user-management/UserManagementPage"
import { useAuthStore } from "@/store/authStore"
import { storageGet, storageSet } from "@/lib/storage"

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [isDark, setIsDark] = useState(() => storageGet('dark-mode', false))
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    storageSet('dark-mode', isDark)
  }, [isDark])

  function toggleDark() {
    setIsDark(d => !d)
  }

  if (!user) {
    return <LoginPage isDark={isDark} onToggleDark={toggleDark} />
  }

  const pageContent = {
    dashboard: <DashboardPage />,
    'auction-import': <AuctionImportPage />,
    'item-prices': <ItemPricesPage />,
    recipes: <RecipesPage />,
    'profession-leveling': <ProfessionLevelingPage />,
    prospecting: <ProspectingPage />,
    'theme-settings': <ThemeSettingsPage isDark={isDark} />,
    'user-management': <UserManagementPage />,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header isDark={isDark} onToggleDark={toggleDark} />
        <main className="flex-1 p-6 overflow-auto">
          {pageContent[page]}
        </main>
      </div>
    </div>
  )
}
