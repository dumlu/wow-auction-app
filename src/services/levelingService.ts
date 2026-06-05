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

  const profRecipes = recipes.filter(r => r.profession === profession)

  while (currentSkill < toSkill) {
    const available = profRecipes.filter(r => {
      const canLearn = r.requiredSkill <= currentSkill
      const notGrey = !r.greySkill || r.greySkill > currentSkill
      // orangeSkill is when the recipe first becomes available (turns orange)
      const isAvailable = !r.orangeSkill || r.orangeSkill <= currentSkill
      return canLearn && notGrey && isAvailable
    })

    if (available.length === 0) break

    // Cost each available recipe; pick lowest net cost with no missing prices first
    const costed = available.map(r => calculateRecipeCost(r, summaries, priceSource, manualPrices))
    const withPrices = costed.filter(c => c.missingPrices.length === 0)
    const chosen = withPrices.length > 0
      ? withPrices.reduce((a, b) => a.netCost < b.netCost ? a : b)
      : costed.reduce((a, b) => a.missingPrices.length < b.missingPrices.length ? a : b)

    const recipe = chosen.recipe
    const greyAt = recipe.greySkill ?? toSkill + 1
    const targetForThisStep = Math.min(toSkill, greyAt)
    const craftsNeeded = Math.max(1, getCraftsNeeded(recipe, currentSkill, targetForThisStep))

    const stepCost = multiplyCopper(chosen.costPerCraft, craftsNeeded)
    const stepRevenue = multiplyCopper(chosen.outputValue, craftsNeeded)
    const stepNetCost = stepCost - stepRevenue

    for (const p of chosen.missingPrices) allMissingPrices.add(p)

    const reagentRequirements = recipe.reagents.map(r => ({
      itemName: r.itemName,
      totalQuantity: r.quantity * craftsNeeded,
    }))

    steps.push({
      fromSkill: currentSkill,
      toSkill: targetForThisStep,
      recipe,
      craftsNeeded,
      reagentRequirements,
      totalCost: stepCost,
      totalRevenue: stepRevenue,
      netCost: stepNetCost,
      missingPrices: chosen.missingPrices,
      costResult: chosen,
    })

    totalCost = addCopper(totalCost, stepCost)
    totalRevenue = addCopper(totalRevenue, stepRevenue)
    currentSkill = targetForThisStep
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
