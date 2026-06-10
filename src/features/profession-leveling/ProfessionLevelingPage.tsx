import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuctionStore, getManualPricesMap } from "@/store/auctionStore"
import { useLevelingStore } from "@/store/levelingStore"
import { calculateLevelingPlan } from "@/services/levelingService"
import { formatCopper, parseGoldSilverCopper } from "@/lib/money"
import type { Profession, Recipe } from "@/types/recipe"
import { AlertTriangle, ChevronRight, Package, Check, Pencil, RotateCcw, Plus, Trash2 } from "lucide-react"

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
  const { recipes: levelingRecipes, initialize, resetToDefaults, loading: levelingLoading, deleteRecipe, updateRecipe, addRecipe } = useLevelingStore()
  
  const [profession, setProfession] = useState<Profession>('Alchemy')
  const [fromSkill, setFromSkill] = useState(1)
  const [toSkill, setToSkill] = useState(300)
  const [calcTick, setCalcTick] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    initialize()
  }, [])

  const manualPricesMap = useMemo(() => getManualPricesMap(entries), [entries])

  const plan = useMemo(() => {
    return calculateLevelingPlan(profession, fromSkill, toSkill, levelingRecipes, summaries, priceSource, manualPricesMap)
  }, [calcTick, profession, fromSkill, toSkill, levelingRecipes, summaries, priceSource, manualPricesMap])

  function calculate() { setCalcTick(t => t + 1) }

  const profRecipes = levelingRecipes.filter(r => r.profession === profession)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profession Leveling</h1>
          <p className="text-muted-foreground text-sm mt-1">Calculate the most cost-efficient path to level a profession</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'View Mode' : 'Edit Guide'}
          </Button>
          <Button size="sm" variant="ghost" onClick={resetToDefaults} disabled={levelingLoading}>
            <RotateCcw className="h-3 w-3 mr-1" /> Reset Defaults
          </Button>
        </div>
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
            <Button onClick={calculate}>Recalculate</Button>
          </div>
        </CardContent>
      </Card>

      {plan && !isEditing && (
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
                Switch to Edit Mode to manage the guide.
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

      {isEditing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{profession} Leveling Guide Editor</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Manage the leveling path and required crafts for each step.</p>
              </div>
              <Button size="sm" onClick={() => addRecipe({ 
                profession, 
                recipeName: 'New Step', 
                requiredSkill: 1, 
                outputItem: '', 
                outputQuantity: 1, 
                reagents: [],
                guideCrafts: 10,
                yellowSkill: 50 // Default end of range for new step
              })}>
                <Plus className="h-3 w-3 mr-1" /> Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium w-32">Skill Range</th>
                    <th className="text-left px-4 py-2 font-medium">Recipe Name</th>
                    <th className="text-left px-4 py-2 font-medium">Output Item</th>
                    <th className="text-center px-4 py-2 font-medium w-20">Crafts</th>
                    <th className="text-right px-4 py-2 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {profRecipes.map(r => (
                    <tr key={r.id} className="border-b hover:bg-muted/30 group">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <Input 
                            type="number" 
                            className="h-7 text-xs px-1 w-12" 
                            value={r.requiredSkill} 
                            onChange={e => updateRecipe({ ...r, requiredSkill: +e.target.value })} 
                          />
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <Input 
                            type="number" 
                            className="h-7 text-xs px-1 w-12" 
                            value={r.yellowSkill || r.requiredSkill + 10} 
                            onChange={e => updateRecipe({ ...r, yellowSkill: +e.target.value })} 
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          className="h-7 text-xs" 
                          value={r.recipeName} 
                          onChange={e => updateRecipe({ ...r, recipeName: e.target.value })} 
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          className="h-7 text-xs" 
                          value={r.outputItem} 
                          onChange={e => updateRecipe({ ...r, outputItem: e.target.value })} 
                        />
                      </td>
                      <td className="px-4 py-2 w-24">
                        <Input 
                          type="number" 
                          className="h-7 text-xs text-center font-mono" 
                          value={r.guideCrafts || 0} 
                          min={1}
                          max={999}
                          onChange={e => updateRecipe({ ...r, guideCrafts: +e.target.value })} 
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                         <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive opacity-0 group-hover:opacity-100" onClick={() => deleteRecipe(r.id!)}>
                           <Trash2 className="h-3 w-3" />
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-muted/20 text-[10px] text-muted-foreground flex justify-between items-center">
              <span>* Reagents are shared with the main Recipe list. Editing details here updates your personal guide.</span>
              <Badge variant="outline" className="font-normal">{profRecipes.length} steps in guide</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
