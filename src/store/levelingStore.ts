import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Recipe, Profession } from '@/types/recipe'
import { SEED_RECIPES } from '@/data/seedRecipes'

interface LevelingState {
  recipes: Recipe[]
  loading: boolean
  initialize: () => Promise<void>
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<void>
  updateRecipe: (recipe: Recipe) => Promise<void>
  deleteRecipe: (id: string) => Promise<void>
  resetToDefaults: () => Promise<void>
}

export const useLevelingStore = create<LevelingState>((set, get) => ({
  recipes: [],
  loading: false,

  initialize: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('leveling_recipes')
        .select('*')
        .order('required_skill', { ascending: true })

      if (error) throw error

      if (!data || data.length === 0) {
        // If DB is empty, seed it with current SEED_RECIPES
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const dbEntries = SEED_RECIPES.map(r => ({
            profession: r.profession,
            recipe_name: r.recipeName,
            required_skill: r.requiredSkill,
            output_item: r.outputItem,
            output_quantity: r.outputQuantity,
            reagents: r.reagents,
            orange_skill: r.orangeSkill,
            yellow_skill: r.yellowSkill,
            green_skill: r.greenSkill,
            grey_skill: r.greySkill,
            guide_crafts: r.guideCrafts,
            user_id: user.id
          }))
          await supabase.from('leveling_recipes').insert(dbEntries)
          // Re-fetch
          const { data: newData } = await supabase.from('leveling_recipes').select('*').order('required_skill', { ascending: true })
          set({ recipes: (newData || []).map(mapDbToRecipe), loading: false })
        } else {
          set({ recipes: SEED_RECIPES, loading: false })
        }
      } else {
        set({ recipes: data.map(mapDbToRecipe), loading: false })
      }
    } catch (e) {
      console.error('Failed to initialize leveling store:', e)
      set({ loading: false })
    }
  },

  addRecipe: async (recipe) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not logged in')
      
      const { data, error } = await supabase.from('leveling_recipes').insert([{
        profession: recipe.profession,
        recipe_name: recipe.recipeName,
        required_skill: recipe.requiredSkill,
        output_item: recipe.outputItem,
        output_quantity: recipe.outputQuantity,
        reagents: recipe.reagents,
        orange_skill: recipe.orangeSkill,
        yellow_skill: recipe.yellowSkill,
        green_skill: recipe.greenSkill,
        grey_skill: recipe.greySkill,
        guide_crafts: recipe.guideCrafts,
        user_id: user.id
      }]).select()

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }
      
      if (data) {
        set({ recipes: [...get().recipes, mapDbToRecipe(data[0])].sort((a,b) => a.requiredSkill - b.requiredSkill) })
      }
    } catch (e) {
      console.error('Failed to add recipe:', e)
      alert(`Error adding step: ${e instanceof Error ? e.message : String(e)}`)
    }
  },

  updateRecipe: async (recipe) => {
    try {
      const { error } = await supabase.from('leveling_recipes').update({
        profession: recipe.profession,
        recipe_name: recipe.recipeName,
        required_skill: recipe.requiredSkill,
        output_item: recipe.outputItem,
        output_quantity: recipe.outputQuantity,
        reagents: recipe.reagents,
        orange_skill: recipe.orangeSkill,
        yellow_skill: recipe.yellowSkill,
        green_skill: recipe.greenSkill,
        grey_skill: recipe.greySkill,
        guide_crafts: recipe.guideCrafts
      }).eq('id', recipe.id)
      
      if (error) throw error
      set({ recipes: get().recipes.map(r => r.id === recipe.id ? recipe : r).sort((a,b) => a.requiredSkill - b.requiredSkill) })
    } catch (e) {
      console.error('Failed to update recipe:', e)
    }
  },

  deleteRecipe: async (id) => {
    try {
      const { error } = await supabase.from('leveling_recipes').delete().eq('id', id)
      if (error) throw error
      set({ recipes: get().recipes.filter(r => r.id !== id) })
    } catch (e) {
      console.error('Failed to delete recipe:', e)
    }
  },

  resetToDefaults: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    set({ loading: true })
    await supabase.from('leveling_recipes').delete().eq('user_id', user.id)
    const dbEntries = SEED_RECIPES.map(r => ({
      profession: r.profession,
      recipe_name: r.recipeName,
      required_skill: r.requiredSkill,
      output_item: r.outputItem,
      output_quantity: r.outputQuantity,
      reagents: r.reagents,
      orange_skill: r.orangeSkill,
      yellow_skill: r.yellowSkill,
      green_skill: r.greenSkill,
      grey_skill: r.greySkill,
      guide_crafts: r.guideCrafts,
      user_id: user.id
    }))
    await supabase.from('leveling_recipes').insert(dbEntries)
    const { data } = await supabase.from('leveling_recipes').select('*').order('required_skill', { ascending: true })
    set({ recipes: (data || []).map(mapDbToRecipe), loading: false })
  }
}))

function mapDbToRecipe(row: any): Recipe {
  return {
    id: row.id,
    profession: row.profession,
    recipeName: row.recipe_name,
    requiredSkill: row.required_skill,
    outputItem: row.output_item,
    outputQuantity: row.output_quantity,
    reagents: row.reagents,
    orangeSkill: row.orange_skill,
    yellowSkill: row.yellow_skill,
    greenSkill: row.green_skill,
    greySkill: row.grey_skill,
    guideCrafts: row.guide_crafts
  }
}
