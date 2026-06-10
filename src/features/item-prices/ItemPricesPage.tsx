import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuctionStore } from "@/store/auctionStore"
import { formatCopper, parseGoldSilverCopper } from "@/lib/money"
import type { ItemPriceSummary, PriceSource } from "@/types/auction"
import { Search, ArrowUpDown, Pencil, Check, X, Plus, Trash2 } from "lucide-react"

type SortKey = 'name' | 'minPrice' | 'avgPrice' | 'medianPrice' | 'totalQuantity'

function SortBtn({ k, label, activeKey, dir, onToggle }: { 
  k: SortKey; 
  label: string; 
  activeKey: SortKey; 
  dir: 'asc' | 'desc'; 
  onToggle: (k: SortKey) => void 
}) {
  return (
    <button className="flex items-center gap-1 hover:text-foreground" onClick={() => onToggle(k)}>
      {label}
      <ArrowUpDown className="h-3 w-3" />
      {activeKey === k && <span className="text-xs">{dir === 'asc' ? '↑' : '↓'}</span>}
    </button>
  )
}

// ── Inline price editor cell ───────────────────────────────────────────────
function EditablePrice({ item }: { item: ItemPriceSummary }) {
  const { setManualPrice, removeManualPrice } = useAuctionStore()
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')

  function startEdit() {
    setRaw(formatCopper(item.minPrice))
    setEditing(true)
  }

  function commit() {
    const copper = parseGoldSilverCopper(raw)
    if (copper > 0) setManualPrice(item.itemName, copper)
    setEditing(false)
  }

  function cancel() { setEditing(false) }

  if (editing) {
    return (
      <div className="flex items-center gap-1 justify-end">
        <Input
          className="w-28 h-6 text-xs font-mono px-1"
          value={raw}
          autoFocus
          onChange={e => setRaw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel() }}
        />
        <button onClick={commit} className="text-green-600 hover:opacity-70"><Check className="h-3 w-3" /></button>
        <button onClick={cancel} className="text-muted-foreground hover:opacity-70"><X className="h-3 w-3" /></button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 justify-end group">
      <span className="font-mono text-xs text-green-600 dark:text-green-400">{formatCopper(item.minPrice)}</span>
      <button
        onClick={startEdit}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
      >
        <Pencil className="h-3 w-3" />
      </button>
      {item.isManual && (
        <button
          onClick={() => removeManualPrice(item.itemName)}
          className="opacity-0 group-hover:opacity-100 text-destructive hover:opacity-70 transition-opacity"
          title="Remove manual price"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

// ── Add new item manually ──────────────────────────────────────────────────
function AddManualRow({ onClose }: { onClose: () => void }) {
  const { setManualPrice } = useAuctionStore()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  function commit() {
    if (!name.trim()) return
    const copper = parseGoldSilverCopper(price)
    if (copper <= 0) return
    setManualPrice(name.trim(), copper)
    onClose()
  }

  return (
    <tr className="border-b bg-muted/30">
      <td className="px-4 py-2">
        <Input
          className="h-7 text-xs"
          placeholder="Item name"
          value={name}
          autoFocus
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit()}
        />
      </td>
      <td className="px-4 py-2" colSpan={3}>
        <Input
          className="h-7 text-xs font-mono"
          placeholder="e.g. 1g 50s or 15000"
          value={price}
          onChange={e => setPrice(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onClose() }}
        />
      </td>
      <td className="px-4 py-2" colSpan={3}>
        <div className="flex gap-1 justify-end">
          <Button size="sm" className="h-7 px-2" onClick={commit}>Add</Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onClose}>Cancel</Button>
        </div>
      </td>
    </tr>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export function ItemPricesPage() {
  const { summaries, priceSource, setPriceSource } = useAuctionStore()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [addingNew, setAddingNew] = useState(false)

  const items = useMemo(() => {
    let list = [...summaries.values()]
    if (search) list = list.filter(i => i.itemName.toLowerCase().includes(search.toLowerCase()))
    list.sort((a, b) => {
      if (sortKey === 'name') {
        const cmp = a.itemName.localeCompare(b.itemName)
        return sortDir === 'asc' ? cmp : -cmp
      }
      const cmp = (a[sortKey] as number) - (b[sortKey] as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [summaries, search, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Item Prices</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse and search auction house prices</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAddingNew(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Manual Price
        </Button>
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
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
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
                  <th className="text-left px-4 py-3 font-medium">
                    <SortBtn k="name" label="Item" activeKey={sortKey} dir={sortDir} onToggle={toggleSort} />
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    <SortBtn k="minPrice" label="Min" activeKey={sortKey} dir={sortDir} onToggle={toggleSort} />
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    <SortBtn k="avgPrice" label="Avg" activeKey={sortKey} dir={sortDir} onToggle={toggleSort} />
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    <SortBtn k="medianPrice" label="Median" activeKey={sortKey} dir={sortDir} onToggle={toggleSort} />
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    <SortBtn k="totalQuantity" label="Qty" activeKey={sortKey} dir={sortDir} onToggle={toggleSort} />
                  </th>
                  <th className="text-right px-4 py-3 font-medium">Auctions</th>
                  <th className="text-right px-4 py-3 font-medium">Last Scan</th>
                </tr>
              </thead>
              <tbody>
                {addingNew && <AddManualRow onClose={() => setAddingNew(false)} />}
                {items.map(item => (
                  <tr key={item.itemName} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.itemName}</span>
                        {item.isManual && (
                          <Badge variant="outline" className="text-xs py-0 text-amber-600 border-amber-400">
                            Manual
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <EditablePrice item={item} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs">{formatCopper(item.avgPrice)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs">{formatCopper(item.medianPrice)}</td>
                    <td className="px-4 py-2.5 text-right"><Badge variant="secondary">{item.totalQuantity}</Badge></td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{item.auctionCount}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground text-xs">
                      {item.lastScanDate ? new Date(item.lastScanDate).toLocaleDateString('tr-TR') : '-'}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && !addingNew && (
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
