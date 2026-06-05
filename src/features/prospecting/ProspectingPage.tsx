import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuctionStore } from "@/store/auctionStore"
import { calculateProspecting } from "@/services/prospectingService"
import { formatCopper, parseGoldSilverCopper } from "@/lib/money"
import { SEED_DROP_TABLES } from "@/data/seedDropTables"
import { AlertTriangle } from "lucide-react"

export function ProspectingPage() {
  const { summaries, priceSource } = useAuctionStore()
  const [selectedTableId, setSelectedTableId] = useState(SEED_DROP_TABLES[0].id)
  const [quantity, setQuantity] = useState(200)
  const [priceOverrideStr, setPriceOverrideStr] = useState('')
  const [calculated, setCalculated] = useState(false)

  const selectedTable = SEED_DROP_TABLES.find(t => t.id === selectedTableId) ?? SEED_DROP_TABLES[0]
  const priceOverride = priceOverrideStr ? parseGoldSilverCopper(priceOverrideStr) : undefined

  const result = useMemo(() => {
    if (!calculated) return null
    return calculateProspecting(selectedTable, quantity, summaries, priceSource, undefined, priceOverride)
  }, [calculated, selectedTable, quantity, summaries, priceSource, priceOverride])

  const auctionPrice = summaries.get(selectedTable.inputItem.toLowerCase())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prospecting Calculator</h1>
        <p className="text-muted-foreground text-sm mt-1">Calculate expected value from prospecting or milling</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Setup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <Label>Input Ore/Item</Label>
              <Select value={selectedTableId} onValueChange={v => { setSelectedTableId(v); setCalculated(false) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEED_DROP_TABLES.map(t => <SelectItem key={t.id} value={t.id}>{t.inputItem}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Quantity</Label>
              <Input type="number" min={1} value={quantity} onChange={e => { setQuantity(+e.target.value); setCalculated(false) }} />
            </div>
            <div className="space-y-1">
              <Label>
                Price per Unit Override
                {auctionPrice && <span className="text-xs text-muted-foreground ml-1">(AH: {formatCopper(auctionPrice.minPrice)})</span>}
              </Label>
              <Input
                placeholder={auctionPrice ? formatCopper(auctionPrice.minPrice) : 'e.g. 4s 50c'}
                value={priceOverrideStr}
                onChange={e => { setPriceOverrideStr(e.target.value); setCalculated(false) }}
              />
            </div>
          </div>

          <div className="p-3 rounded-md bg-muted text-sm">
            <p className="font-medium mb-1">Drop Table: {selectedTable.inputItem}</p>
            <p className="text-muted-foreground text-xs">{selectedTable.inputQuantityPerRoll} ore per prospect roll</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTable.possibleDrops.map(d => (
                <Badge key={d.itemName} variant="outline" className="text-xs">
                  {d.itemName} ({(d.chance * 100).toFixed(0)}% · {d.minQty}-{d.maxQty})
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={() => setCalculated(true)} className="w-full">Calculate Expected Value</Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {result.missingPrices.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-yellow-50 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <span>Missing prices for: {result.missingPrices.join(', ')}. Revenue may be underestimated.</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-lg font-bold text-destructive">{formatCopper(result.totalInputCost)}</p>
                <p className="text-xs text-muted-foreground">Input Cost</p>
                <p className="text-xs text-muted-foreground">{formatCopper(result.inputCostPerUnit)}/ea</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-lg font-bold text-green-600">{formatCopper(result.expectedRevenue)}</p>
                <p className="text-xs text-muted-foreground">Expected Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className={`text-lg font-bold ${result.expectedProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {formatCopper(Math.abs(result.expectedProfit))}
                </p>
                <p className="text-xs text-muted-foreground">{result.expectedProfit >= 0 ? 'Profit' : 'Loss'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-lg font-bold">{formatCopper(result.breakEvenUnitPrice)}</p>
                <p className="text-xs text-muted-foreground">Break-Even Price/ea</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expected Drops</CardTitle>
              <CardDescription>
                {Math.floor(result.inputQuantity / selectedTable.inputQuantityPerRoll)} prospect rolls from {result.inputQuantity}x {result.inputItem}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left pb-2">Item</th>
                    <th className="text-right pb-2">Expected Qty</th>
                    <th className="text-right pb-2">Unit Price</th>
                    <th className="text-right pb-2">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.expectedDrops.map(drop => (
                    <tr key={drop.itemName} className="border-b">
                      <td className="py-2 font-medium">{drop.itemName}</td>
                      <td className="py-2 text-right">{drop.expectedQty.toFixed(2)}</td>
                      <td className="py-2 text-right font-mono text-xs">
                        {drop.missingPrice ? <Badge variant="destructive" className="text-xs">Missing</Badge> : formatCopper(drop.unitPrice)}
                      </td>
                      <td className="py-2 text-right font-mono text-xs font-bold">
                        {drop.missingPrice ? '-' : formatCopper(drop.totalValue)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="pt-2" colSpan={3}>Total Expected Revenue</td>
                    <td className="pt-2 text-right font-mono text-sm text-green-600">{formatCopper(result.expectedRevenue)}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
