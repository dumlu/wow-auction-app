import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuctionStore } from "@/store/auctionStore"
import { useRecipeStore } from "@/store/recipeStore"
import { formatCopper } from "@/lib/money"
import { BarChart3, Package, BookOpen, TrendingUp, AlertTriangle } from "lucide-react"

export function DashboardPage() {
  const { summaries, sessions, useDemoData, entries } = useAuctionStore()
  const { recipes } = useRecipeStore()
  const itemCount = summaries.size
  const totalAuctions = entries.length
  const lastSession = sessions[sessions.length - 1]

  const topItems = [...summaries.values()]
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5)

  const mostExpensive = [...summaries.values()]
    .filter(s => s.minPrice > 0)
    .sort((a, b) => b.minPrice - a.minPrice)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your auction house data</p>
        </div>
        <span className="text-xs text-muted-foreground">
          Build: {new Date(__BUILD_DATE__).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      </div>

      {useDemoData && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-secondary text-secondary-foreground text-sm">
          <AlertTriangle className="h-4 w-4" />
          Using demo data. Import your Auctionator LUA file to use real prices.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{itemCount}</p>
                <p className="text-xs text-muted-foreground">Tracked Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalAuctions}</p>
                <p className="text-xs text-muted-foreground">Imported Auctions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{recipes.length}</p>
                <p className="text-xs text-muted-foreground">Recipes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{sessions.length}</p>
                <p className="text-xs text-muted-foreground">Imports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Stocked Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topItems.map(item => (
                <div key={item.itemName} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.itemName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.totalQuantity} qty</Badge>
                    <span className="text-muted-foreground w-24 text-right">{formatCopper(item.minPrice)}/ea</span>
                  </div>
                </div>
              ))}
              {topItems.length === 0 && <p className="text-muted-foreground text-sm">No data</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Expensive Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mostExpensive.map(item => (
                <div key={item.itemName} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.itemName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 font-mono text-xs">{formatCopper(item.minPrice)}</span>
                  </div>
                </div>
              ))}
              {mostExpensive.length === 0 && <p className="text-muted-foreground text-sm">No data</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {lastSession && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last Import</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div className="flex gap-4">
              <span className="text-muted-foreground">File:</span>
              <span className="font-medium">{lastSession.fileName}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-muted-foreground">Realm:</span>
              <span className="font-medium">{lastSession.realm ?? 'Unknown'}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-muted-foreground">Entries:</span>
              <span className="font-medium">{lastSession.entryCount}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{new Date(lastSession.importDate).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
