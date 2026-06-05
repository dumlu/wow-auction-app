import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuctionStore } from "@/store/auctionStore"
import { formatCopper } from "@/lib/money"
import type { PriceSource } from "@/types/auction"
import { Search, ArrowUpDown } from "lucide-react"

type SortKey = 'name' | 'minPrice' | 'avgPrice' | 'medianPrice' | 'totalQuantity'

export function ItemPricesPage() {
  const { summaries, priceSource, setPriceSource } = useAuctionStore()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const items = useMemo(() => {
    let list = [...summaries.values()]
    if (search) list = list.filter(i => i.itemName.toLowerCase().includes(search.toLowerCase()))
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.itemName.localeCompare(b.itemName)
      else cmp = (a[sortKey] as number) - (b[sortKey] as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [summaries, search, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort(k)}>
      {label}
      <ArrowUpDown className="h-3 w-3" />
      {sortKey === k && <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </button>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Item Prices</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse and search auction house prices</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={priceSource} onValueChange={v => setPriceSource(v as PriceSource)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="min">Min Price</SelectItem>
            <SelectItem value="avg">Avg Price</SelectItem>
            <SelectItem value="median">Median Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium"><SortBtn k="name" label="Item" /></th>
                  <th className="text-right px-4 py-3 font-medium"><SortBtn k="minPrice" label="Min" /></th>
                  <th className="text-right px-4 py-3 font-medium"><SortBtn k="avgPrice" label="Avg" /></th>
                  <th className="text-right px-4 py-3 font-medium"><SortBtn k="medianPrice" label="Median" /></th>
                  <th className="text-right px-4 py-3 font-medium"><SortBtn k="totalQuantity" label="Qty" /></th>
                  <th className="text-right px-4 py-3 font-medium">Auctions</th>
                  <th className="text-right px-4 py-3 font-medium">Last Scan</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.itemName} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.itemName}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-green-600 dark:text-green-400">{formatCopper(item.minPrice)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatCopper(item.avgPrice)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatCopper(item.medianPrice)}</td>
                    <td className="px-4 py-3 text-right"><Badge variant="secondary">{item.totalQuantity}</Badge></td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{item.auctionCount}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                      {item.lastScanDate ? new Date(item.lastScanDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">{items.length} items shown</p>
    </div>
  )
}
