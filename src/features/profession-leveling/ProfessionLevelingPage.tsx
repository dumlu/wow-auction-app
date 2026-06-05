import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuctionStore, getManualPricesMap } from "@/store/auctionStore"
import { useRecipeStore } from "@/store/recipeStore"
import { calculateLevelingPlan } from "@/services/levelingService"
import { formatCopper, parseGoldSilverCopper } from "@/lib/money"
import type { Profession } from "@/types/recipe"
import { AlertTriangle, ChevronRight, Package, Check, Pencil } from "lucide-react"

const PROFESSIONS: Profession[] = ['Alchemy','Blacksmithing','Enchanting','Engineering','Jewelcrafting','Leatherworking','Mining','Tailoring']

// ── Inline price editor for a single missing item ──────────────────────────
function MissingPriceRow({ itemName, existingPrice, onSave }: {
  itemName: string
  existingPrice: number | undefined
  onSave: (itemName: string, copper: number) => void
}) {
  const [editing, setEditing] = useState(!existingPrice)
  const [raw, setRaw] = useState(existingPrice ? formatCopper(existingPrice) : '')
  const [saved, setSaved] = useState(!!existingPrice)

  function commit() {
    const copper = parseGoldSilverCopper(raw)
    if (copper <= 0) return
    onSave(itemName, copper)
    setSaved(true)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-0">
      <span className="flex-1 text-sm font-medium">{itemName}</span>

      {editing ? (
        <>
          <Input
            className="w-36 h-7 text-xs font-mono"
            placeholder="e.g. 1g 50s or 15000"
            value={raw}
            onChange={e => { setRaw(e.target.value); setSaved(false) }}
            onKeyDown={e => e.key === 'Enter' && commit()}
            autoFocus
          />
          <Button size="sm" className="h-7 px-2" onClick={commit} disabled={!raw.trim()}>
            <Check className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm font-mono text-green-600 dark:text-green-400">
            {saved && existingPrice ? formatCopper(existingPrice) : raw ? formatCopper(parseGoldSilverCopper(raw)) : '—'}
          </span>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3 w-3" />
          </button>
          {saved && <Check className="h-3 w-3 text-green-600 shrink-0" />}
        </>
      )}
    </div>
  )
}

// ── Missing prices panel ───────────────────────────────────────────────────
function MissingPricesPanel({ missingItems, onRecalculate }: {
  missingItems: string[]
  onRecalculate: () => void
}) {
  const { entries, setManualPrice, summaries } = useAuctionStore()
  const manualPrices = getManualPricesMap(entries)

  function handleSave(itemName: string, copper: number) {
    setManualPrice(itemName, copper)
  }

  const allFilled = missingItems.every(item => {
    const key = item.toLowerCase()
    return manualPrices.has(key) || summaries.has(key)
  })

  return (
    <Card className="border-amber-300 dark:border-amber-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">Missing Prices</CardTitle>
            <Badge variant="secondary">{missingItems.length}</Badge>
          </div>
          {allFilled && (
            <Button size="sm" onClick={onRecalculate}>
              Recalculate
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Girilen fiyatlar veritabanına kaydedilir. Format: <span className="font-mono">1g 50s</span>, <span className="font-mono">75s 20c</span> veya copper sayısı.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {missingItems.map(item => (
          <MissingPriceRow
            key={item}
            itemName={item}
            existingPrice={manualPrices.get(item.toLowerCase())}
            onSave={handleSave}
          />
        ))}
      </CardContent>
    </Card>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export function ProfessionLevelingPage() {
  const { summaries, priceSource, entries } = useAuctionStore()
  const { recipes } = useRecipeStore()
  const [profession, setProfession] = useState<Profession>('Alchemy')
  const [fromSkill, setFromSkill] = useState(1)
  const [toSkill, setToSkill] = useState(300)
  const [calcTick, setCalcTick] = useState(0)

  const manualPricesMap = useMemo(() => getManualPricesMap(entries), [entries])

  const plan = useMemo(() => {
    if (calcTick === 0) return null
    return calculateLevelingPlan(profession, fromSkill, toSkill, recipes, summaries, priceSource, manualPricesMap)
  }, [calcTick, profession, fromSkill, toSkill, recipes, summaries, priceSource, manualPricesMap])

  function calculate() { setCalcTick(t => t + 1) }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profession Leveling</h1>
        <p className="text-muted-foreground text-sm mt-1">Calculate the most cost-efficient path to level a profession</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <Label>Profession</Label>
              <Select value={profession} onValueChange={v => { setProfession(v as Profession); setCalcTick(0) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROFESSIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>From Skill</Label>
              <Input type="number" min={1} max={374} value={fromSkill} onChange={e => { setFromSkill(+e.target.value); setCalcTick(0) }} />
            </div>
            <div className="space-y-1">
              <Label>To Skill</Label>
              <Input type="number" min={1} max={375} value={toSkill} onChange={e => { setToSkill(+e.target.value); setCalcTick(0) }} />
            </div>
            <Button onClick={calculate}>Calculate</Button>
          </div>
        </CardContent>
      </Card>

      {plan && (
        <>
          {/* Missing prices — editable inline */}
          {plan.allMissingPrices.length > 0 && (
            <MissingPricesPanel
              missingItems={plan.allMissingPrices}
              onRecalculate={calculate}
            />
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-destructive">{formatCopper(plan.totalCost)}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Cost</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-green-600">{formatCopper(plan.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">Est. Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className={`text-2xl font-bold ${plan.netCost < 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {formatCopper(Math.abs(plan.netCost))}
                  <span className="text-sm ml-1">{plan.netCost < 0 ? 'profit' : 'loss'}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Net Cost</p>
              </CardContent>
            </Card>
          </div>

          {/* Steps */}
          {plan.steps.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No recipes found for {profession} between skill {fromSkill} and {toSkill}.<br />
                Add recipes in the Recipes tab.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {plan.steps.map((step, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2 shrink-0 text-sm font-mono text-muted-foreground w-28">
                        {step.fromSkill} <ChevronRight className="h-3 w-3" /> {step.toSkill}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{step.recipe.recipeName}</span>
                          <Badge variant="secondary">{step.craftsNeeded}x crafts</Badge>
                          {step.missingPrices.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {step.missingPrices.length} missing
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {step.reagentRequirements.map(r => {
                            const hasPrice = summaries.has(r.itemName.toLowerCase()) ||
                              manualPricesMap.has(r.itemName.toLowerCase())
                            return (
                              <Badge
                                key={r.itemName}
                                variant={hasPrice ? 'outline' : 'destructive'}
                                className="text-xs"
                              >
                                <Package className="h-3 w-3 mr-1" />
                                {r.totalQuantity}x {r.itemName}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        <p className="text-sm font-mono font-bold">{formatCopper(step.totalCost)}</p>
                        {step.totalRevenue > 0 && (
                          <p className={`text-xs font-mono ${step.netCost < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                            Net: {formatCopper(step.netCost)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Total reagents */}
          <Card>
            <CardHeader><CardTitle className="text-base">Total Reagent Requirements</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(
                  plan.steps.flatMap(s => s.reagentRequirements).reduce((acc, r) => {
                    acc[r.itemName] = (acc[r.itemName] ?? 0) + r.totalQuantity
                    return acc
                  }, {} as Record<string, number>)
                ).sort(([a], [b]) => a.localeCompare(b)).map(([item, qty]) => {
                  const hasPrice = summaries.has(item.toLowerCase()) ||
                    manualPricesMap.has(item.toLowerCase())
                  return (
                    <div
                      key={item}
                      className={`flex items-center justify-between p-2 rounded-md text-sm ${
                        hasPrice ? 'bg-muted' : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      <span>{item}</span>
                      <Badge variant={hasPrice ? 'secondary' : 'destructive'}>{qty}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
