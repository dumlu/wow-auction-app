import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useRecipeStore } from "@/store/recipeStore"
import { useAuctionStore } from "@/store/auctionStore"
import { calculateRecipeCost } from "@/services/recipeService"
import { formatCopper } from "@/lib/money"
import type { Recipe, Profession, Reagent } from "@/types/recipe"
import { Plus, Download, Upload, Trash2, Search } from "lucide-react"

const PROFESSIONS: Profession[] = ['Alchemy','Blacksmithing','Enchanting','Engineering','Jewelcrafting','Leatherworking','Mining','Tailoring']

function RecipeForm({ onSave, initial }: { onSave: (r: Recipe) => void; initial?: Partial<Recipe> }) {
  const [form, setForm] = useState<Partial<Recipe>>(initial ?? { profession: 'Alchemy', reagents: [], outputQuantity: 1, requiredSkill: 1 })
  const [reagentLine, setReagentLine] = useState('')

  function addReagent() {
    const parts = reagentLine.split('x').map(s => s.trim())
    if (parts.length < 2) return
    const qty = parseInt(parts[0])
    const name = parts.slice(1).join('x').trim()
    if (!name || isNaN(qty)) return
    setForm(f => ({ ...f, reagents: [...(f.reagents ?? []), { itemName: name, quantity: qty }] }))
    setReagentLine('')
  }

  function removeReagent(i: number) {
    setForm(f => ({ ...f, reagents: f.reagents?.filter((_, idx) => idx !== i) }))
  }

  function save() {
    if (!form.recipeName || !form.outputItem || !form.profession) return
    onSave({
      id: initial?.id ?? `recipe-${Date.now()}`,
      profession: form.profession!,
      recipeName: form.recipeName!,
      requiredSkill: form.requiredSkill ?? 1,
      outputItem: form.outputItem!,
      outputQuantity: form.outputQuantity ?? 1,
      reagents: form.reagents ?? [],
      greySkill: form.greySkill,
    } as Recipe)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Profession</Label>
          <Select value={form.profession} onValueChange={v => setForm(f => ({ ...f, profession: v as Profession }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PROFESSIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Required Skill</Label>
          <Input type="number" value={form.requiredSkill ?? 1} onChange={e => setForm(f => ({ ...f, requiredSkill: +e.target.value }))} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Recipe Name</Label>
        <Input value={form.recipeName ?? ''} onChange={e => setForm(f => ({ ...f, recipeName: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Output Item</Label>
          <Input value={form.outputItem ?? ''} onChange={e => setForm(f => ({ ...f, outputItem: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label>Output Qty</Label>
          <Input type="number" value={form.outputQuantity ?? 1} onChange={e => setForm(f => ({ ...f, outputQuantity: +e.target.value }))} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Grey Skill (becomes grey at)</Label>
        <Input type="number" value={form.greySkill ?? ''} placeholder="e.g. 75" onChange={e => setForm(f => ({ ...f, greySkill: +e.target.value || undefined }))} />
      </div>
      <div className="space-y-2">
        <Label>Reagents (format: 2x Copper Ore)</Label>
        {form.reagents?.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <Badge variant="outline">{r.quantity}x {r.itemName}</Badge>
            <button onClick={() => removeReagent(i)} className="text-destructive hover:opacity-70"><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input placeholder="2x Copper Ore" value={reagentLine} onChange={e => setReagentLine(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReagent()} />
          <Button size="sm" onClick={addReagent}>Add</Button>
        </div>
      </div>
      <Button className="w-full" onClick={save}>Save Recipe</Button>
    </div>
  )
}

export function RecipesPage() {
  const { recipes, addRecipe, deleteRecipe, importRecipes, resetToDefaults } = useRecipeStore()
  const { summaries, priceSource } = useAuctionStore()
  const [search, setSearch] = useState('')
  const [filterProf, setFilterProf] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const manualPricesMap = new Map<string, number>()

  const filtered = recipes.filter(r => {
    const matchSearch = !search || r.recipeName.toLowerCase().includes(search.toLowerCase()) || r.outputItem.toLowerCase().includes(search.toLowerCase())
    const matchProf = filterProf === 'all' || r.profession === filterProf
    return matchSearch && matchProf
  })

  function exportJSON() {
    const blob = new Blob([JSON.stringify(recipes, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'recipes.json'; a.click()
    URL.revokeObjectURL(url)
  }

  function importJSON() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return
      const text = await file.text()
      try { importRecipes(JSON.parse(text)) } catch { alert('Invalid JSON') }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recipes</h1>
          <p className="text-muted-foreground text-sm mt-1">{recipes.length} recipes · cost calculated from auction prices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportJSON}><Download className="h-4 w-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm" onClick={importJSON}><Upload className="h-4 w-4 mr-1" />Import</Button>
          <Button variant="outline" size="sm" onClick={() => resetToDefaults()}>Reset Defaults</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Recipe</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add Recipe</DialogTitle></DialogHeader>
              <RecipeForm onSave={r => { addRecipe(r); setDialogOpen(false) }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search recipes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterProf} onValueChange={setFilterProf}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Professions</SelectItem>
            {PROFESSIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map(recipe => {
          const cost = calculateRecipeCost(recipe, summaries, priceSource, manualPricesMap)
          return (
            <Card key={recipe.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold truncate">{recipe.recipeName}</span>
                      <Badge variant="outline" className="shrink-0">{recipe.profession}</Badge>
                      <Badge variant="secondary" className="shrink-0">Skill {recipe.requiredSkill}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      → {recipe.outputQuantity}x {recipe.outputItem}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.reagents.map(r => (
                        <Badge key={r.itemName} variant="outline" className="text-xs">{r.quantity}x {r.itemName}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    {cost.missingPrices.length > 0 ? (
                      <Badge variant="destructive" className="text-xs">Missing: {cost.missingPrices.join(', ')}</Badge>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">Cost</p>
                        <p className="font-mono text-sm font-bold">{formatCopper(cost.totalCost)}</p>
                        {cost.outputValue > 0 && (
                          <p className={`text-xs font-mono ${cost.netCost < 0 ? 'text-green-600' : 'text-destructive'}`}>
                            Net: {formatCopper(cost.netCost)}
                          </p>
                        )}
                      </>
                    )}
                    <button onClick={() => { if (confirm(`Delete ${recipe.recipeName}?`)) deleteRecipe(recipe.id) }} className="text-destructive hover:opacity-70 mt-1 block">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No recipes found</p>}
      </div>
    </div>
  )
}
