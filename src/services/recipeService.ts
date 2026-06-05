import type { Recipe, RecipeCostResult } from '@/types/recipe'
import type { ItemPriceSummary, PriceSource } from '@/types/auction'
import { lookupPrice } from './auctionService'
import { multiplyCopper, addCopper } from '@/lib/money'

export function calculateRecipeCost(
  recipe: Recipe,
  summaries: Map<string, ItemPriceSummary>,
  priceSource: PriceSource,
  manualPrices?: Map<string, number>
): RecipeCostResult {
  const reagentCosts: RecipeCostResult['reagentCosts'] = []
  const missingPrices: string[] = []
  let totalCost = 0

  for (const reagent of recipe.reagents) {
    const unitPrice = lookupPrice(reagent.itemName, summaries, priceSource, manualPrices)
    if (unitPrice === null) {
      missingPrices.push(reagent.itemName)
      reagentCosts.push({ itemName: reagent.itemName, quantity: reagent.quantity, unitPrice: 0, totalCost: 0 })
    } else {
      const reagentTotal = multiplyCopper(unitPrice, reagent.quantity)
      totalCost = addCopper(totalCost, reagentTotal)
      reagentCosts.push({ itemName: reagent.itemName, quantity: reagent.quantity, unitPrice, totalCost: reagentTotal })
    }
  }

  const costPerCraft = totalCost
  const outputPrice = lookupPrice(recipe.outputItem, summaries, priceSource, manualPrices)
  const outputValue = outputPrice !== null ? multiplyCopper(outputPrice, recipe.outputQuantity) : 0
  const netCost = totalCost - outputValue

  return { recipe, totalCost, costPerCraft, missingPrices, reagentCosts, outputValue, netCost }
}
