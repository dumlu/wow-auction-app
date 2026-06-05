import type { DropTable } from '@/types/prospecting'

export const SEED_DROP_TABLES: DropTable[] = [
  {
    id: 'prospect-copper',
    inputItem: 'Copper Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Malachite', chance: 0.25, minQty: 1, maxQty: 2 },
      { itemName: 'Tigerseye', chance: 0.25, minQty: 1, maxQty: 2 },
      { itemName: 'Shadowgem', chance: 0.075, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'prospect-tin',
    inputItem: 'Tin Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Moss Agate', chance: 0.22, minQty: 1, maxQty: 2 },
      { itemName: 'Lesser Moonstone', chance: 0.2, minQty: 1, maxQty: 2 },
      { itemName: 'Shadowgem', chance: 0.1, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'prospect-iron',
    inputItem: 'Iron Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Citrine', chance: 0.22, minQty: 1, maxQty: 2 },
      { itemName: 'Aquamarine', chance: 0.1, minQty: 1, maxQty: 1 },
      { itemName: 'Star Ruby', chance: 0.05, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'prospect-mithril',
    inputItem: 'Mithril Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Citrine', chance: 0.2, minQty: 1, maxQty: 2 },
      { itemName: 'Aquamarine', chance: 0.15, minQty: 1, maxQty: 2 },
      { itemName: 'Star Ruby', chance: 0.08, minQty: 1, maxQty: 1 },
      { itemName: 'Black Pearl', chance: 0.02, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'prospect-thorium',
    inputItem: 'Thorium Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Huge Emerald', chance: 0.05, minQty: 1, maxQty: 1 },
      { itemName: 'Azerothian Diamond', chance: 0.05, minQty: 1, maxQty: 1 },
      { itemName: 'Star Ruby', chance: 0.12, minQty: 1, maxQty: 2 },
      { itemName: 'Large Opal', chance: 0.1, minQty: 1, maxQty: 2 },
    ],
  },
]
