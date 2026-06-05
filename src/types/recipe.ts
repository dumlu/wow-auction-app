export type Profession =
  | 'Alchemy'
  | 'Blacksmithing'
  | 'Enchanting'
  | 'Engineering'
  | 'Jewelcrafting'
  | 'Leatherworking'
  | 'Mining'
  | 'Tailoring'
  | 'Herbalism'
  | 'Skinning'

export interface Reagent {
  itemName: string
  quantity: number
}

export interface Recipe {
  id: string
  profession: Profession
  recipeName: string
  requiredSkill: number
  outputItem: string
  outputQuantity: number
  reagents: Reagent[]
  skillColor?: 'orange' | 'yellow' | 'green' | 'grey'
  orangeSkill?: number
  yellowSkill?: number
  greenSkill?: number
  greySkill?: number
  guideCrafts?: number   // Wowhead recommended craft count for the full range
}

export interface RecipeCostResult {
  recipe: Recipe
  totalCost: number
  costPerCraft: number
  missingPrices: string[]
  reagentCosts: { itemName: string; quantity: number; unitPrice: number; totalCost: number }[]
  outputValue: number
  netCost: number
}
