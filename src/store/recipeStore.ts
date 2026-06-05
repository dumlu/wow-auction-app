import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Recipe } from '@/types/recipe'
import { SEED_RECIPES } from '@/data/seedRecipes'

interface RecipeState {
  recipes: Recipe[]
  addRecipe: (recipe: Recipe) => void
  updateRecipe: (recipe: Recipe) => void
  deleteRecipe: (id: string) => void
  importRecipes: (recipes: Recipe[]) => void
  resetToDefaults: () => void
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set) => ({
      recipes: SEED_RECIPES,
      addRecipe: (recipe) => set(s => ({ recipes: [...s.recipes, recipe] })),
      updateRecipe: (recipe) => set(s => ({ recipes: s.recipes.map(r => r.id === recipe.id ? recipe : r) })),
      deleteRecipe: (id) => set(s => ({ recipes: s.recipes.filter(r => r.id !== id) })),
      importRecipes: (recipes) => set(s => {
        const existing = new Set(s.recipes.map(r => r.id))
        const newOnes = recipes.filter(r => !existing.has(r.id))
        return { recipes: [...s.recipes, ...newOnes] }
      }),
      resetToDefaults: () => set({ recipes: SEED_RECIPES }),
    }),
    { name: 'wow-recipe-store-v2' }
  )
)
