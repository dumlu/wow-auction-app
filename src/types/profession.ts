import type { Recipe } from './recipe'
import type { RecipeCostResult } from './recipe'

export interface LevelingStep {
  fromSkill: number
  toSkill: number
  recipe: Recipe
  craftsNeeded: number
  reagentRequirements: { itemName: string; totalQuantity: number }[]
  totalCost: number
  totalRevenue: number
  netCost: number
  missingPrices: string[]
  costResult: RecipeCostResult
}

export interface LevelingPlan {
  profession: string
  fromSkill: number
  toSkill: number
  steps: LevelingStep[]
  totalCost: number
  totalRevenue: number
  netCost: number
  allMissingPrices: string[]
}
