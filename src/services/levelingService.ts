import type { Recipe } from '@/types/recipe'
import type { LevelingPlan, LevelingStep } from '@/types/profession'
import type { ItemPriceSummary, PriceSource } from '@/types/auction'
import { calculateRecipeCost } from './recipeService'
import { addCopper, multiplyCopper } from '@/lib/money'

// Average crafts needed per skill point based on color difficulty
function avgCraftsPerSkillPoint(recipe: Recipe, atSkill: number): number {
  const { orangeSkill, yellowSkill, greenSkill, greySkill } = recipe
  if (greySkill && atSkill >= greySkill) return Infinity
  if (greenSkill && atSkill >= greenSkill) return 8   // ~12.5% chance
  if (yellowSkill && atSkill >= yellowSkill) return 3  // ~33% chance
  if (orangeSkill && atSkill >= orangeSkill) return 1  // 100% chance
  return 1
}

function getCraftsNeeded(recipe: Recipe, fromSkill: number, toSkill: number): number {
  const greyAt = recipe.greySkill ?? toSkill + 1
  const target = Math.min(toSkill, greyAt)
  if (fromSkill >= target) return 0

  // If recipe has Wowhead guide crafts, scale proportionally to the requested range
  if (recipe.guideCrafts && recipe.orangeSkill != null && recipe.greySkill != null) {
    const fullRange = recipe.greySkill - recipe.orangeSkill
    const requestedRange = target - fromSkill
    if (fullRange > 0) {
      return Math.max(1, Math.ceil(recipe.guideCrafts * (requestedRange / fullRange)))
    }
  }

  // Fallback: probability model
  let total = 0
  for (let s = fromSkill; s < target; s++) {
    total += avgCraftsPerSkillPoint(recipe, s)
  }
  return Math.max(1, Math.ceil(total))
}

export function calculateLevelingPlan(
  profession: string,
  fromSkill: number,
  toSkill: number,
  recipes: Recipe[],
  summaries: Map<string, ItemPriceSummary>,
  priceSource: PriceSource,
  manualPrices?: Map<string, number>
): LevelingPlan {
  const steps: LevelingStep[] = []
  let currentSkill = fromSkill
  let totalCost = 0
  let totalRevenue = 0
  const allMissingPrices = new Set<string>()

  const profRecipes = recipes.filter(r => r.profession === profession).sort((a,b) => a.requiredSkill - b.requiredSkill)

  // Safety: Prevent infinite loops
  let iterations = 0
  const MAX_ITERATIONS = 500
  
  while (currentSkill < toSkill && iterations < MAX_ITERATIONS) {
    iterations++
    const lastSkill = currentSkill

    // Look for a recipe that specifically starts at or before our current skill
    // AND has a target skill (yellowSkill) greater than our current skill.
    const stepRecipe = profRecipes.find(r => 
      r.requiredSkill <= currentSkill && 
      (r.yellowSkill || 0) > currentSkill
    )

    if (!stepRecipe) {
      // Fallback: Pick the first recipe we can learn that isn't grey
      const available = profRecipes.filter(r => 
        r.requiredSkill <= currentSkill && 
        (!r.greySkill || r.greySkill > currentSkill)
      )
      if (available.length === 0) break
      
      const costed = available.map(r => calculateRecipeCost(r, summaries, priceSource, manualPrices))
      const chosen = costed.reduce((a, b) => a.netCost < b.netCost ? a : b)
      
      const recipe = chosen.recipe
      const target = Math.min(toSkill, recipe.greySkill || toSkill + 1, (recipe.requiredSkill + 10))
      
      // Ensure target is always greater than currentSkill
      const safeTarget = target > currentSkill ? target : currentSkill + 1
      const crafts = getCraftsNeeded(recipe, currentSkill, safeTarget)
      
      addStep(chosen, crafts, safeTarget)
      if (currentSkill <= lastSkill) currentSkill = safeTarget // Force progress
      continue
    }

    // We found a specific guide step
    const chosen = calculateRecipeCost(stepRecipe, summaries, priceSource, manualPrices)
    const target = Math.min(toSkill, stepRecipe.yellowSkill!)
    
    // Ensure target is always greater than currentSkill
    const safeTarget = target > currentSkill ? target : currentSkill + 1
    
    // FORCE use of guideCrafts if it exists and is > 0
    const crafts = (stepRecipe.guideCrafts && stepRecipe.guideCrafts > 0) 
      ? stepRecipe.guideCrafts 
      : getCraftsNeeded(stepRecipe, currentSkill, safeTarget)
    
    addStep(chosen, crafts, safeTarget)
    if (currentSkill <= lastSkill) currentSkill = safeTarget // Force progress
  }

  function addStep(chosen: any, crafts: number, target: number) {
    const recipe = chosen.recipe
    const stepCost = multiplyCopper(chosen.costPerCraft, crafts)
    const stepRevenue = multiplyCopper(chosen.outputValue, crafts)
    
    for (const p of chosen.missingPrices) allMissingPrices.add(p)

    steps.push({
      fromSkill: currentSkill,
      toSkill: target,
      recipe,
      craftsNeeded: crafts,
      reagentRequirements: recipe.reagents.map((r: any) => ({
        itemName: r.itemName,
        totalQuantity: r.quantity * crafts,
      })),
      totalCost: stepCost,
      totalRevenue: stepRevenue,
      netCost: stepCost - stepRevenue,
      missingPrices: chosen.missingPrices,
      costResult: chosen,
    })

    totalCost = addCopper(totalCost, stepCost)
    totalRevenue = addCopper(totalRevenue, stepRevenue)
    currentSkill = target
  }

  return {
    profession,
    fromSkill,
    toSkill,
    steps,
    totalCost,
    totalRevenue,
    netCost: totalCost - totalRevenue,
    allMissingPrices: [...allMissingPrices],
  }
}
