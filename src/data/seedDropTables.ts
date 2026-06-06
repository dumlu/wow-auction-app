import type { DropTable } from '@/types/prospecting'

export const SEED_DROP_TABLES: DropTable[] = [
  // ── Vanilla ──────────────────────────────────────────────────
  {
    id: 'prospect-copper',
    inputItem: 'Copper Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Malachite',      chance: 0.25,  minQty: 1, maxQty: 2 },
      { itemName: 'Tigerseye',      chance: 0.25,  minQty: 1, maxQty: 2 },
      { itemName: 'Shadowgem',      chance: 0.075, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'prospect-tin',
    inputItem: 'Tin Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Moss Agate',      chance: 0.22, minQty: 1, maxQty: 2 },
      { itemName: 'Lesser Moonstone',chance: 0.20, minQty: 1, maxQty: 2 },
      { itemName: 'Shadowgem',       chance: 0.10, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'prospect-iron',
    inputItem: 'Iron Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Citrine',    chance: 0.22, minQty: 1, maxQty: 2 },
      { itemName: 'Aquamarine', chance: 0.10, minQty: 1, maxQty: 1 },
      { itemName: 'Star Ruby',  chance: 0.05, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'prospect-mithril',
    inputItem: 'Mithril Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Citrine',    chance: 0.20, minQty: 1, maxQty: 2 },
      { itemName: 'Aquamarine', chance: 0.15, minQty: 1, maxQty: 2 },
      { itemName: 'Star Ruby',  chance: 0.08, minQty: 1, maxQty: 1 },
      { itemName: 'Black Pearl',chance: 0.02, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'prospect-thorium',
    inputItem: 'Thorium Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Huge Emerald',       chance: 0.05, minQty: 1, maxQty: 1 },
      { itemName: 'Azerothian Diamond', chance: 0.05, minQty: 1, maxQty: 1 },
      { itemName: 'Star Ruby',          chance: 0.12, minQty: 1, maxQty: 2 },
      { itemName: 'Large Opal',         chance: 0.10, minQty: 1, maxQty: 2 },
      { itemName: 'Blue Sapphire',      chance: 0.05, minQty: 1, maxQty: 1 },
    ],
  },

  // ── TBC ──────────────────────────────────────────────────────
  // Fel Iron Ore — drops common TBC gems + Adamantite Powder
  {
    id: 'prospect-fel-iron',
    inputItem: 'Fel Iron Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Blood Garnet',      chance: 0.22, minQty: 1, maxQty: 2 },
      { itemName: 'Deep Peridot',      chance: 0.22, minQty: 1, maxQty: 2 },
      { itemName: 'Shadow Draenite',   chance: 0.22, minQty: 1, maxQty: 2 },
      { itemName: 'Golden Draenite',   chance: 0.22, minQty: 1, maxQty: 2 },
      { itemName: 'Azure Moonstone',   chance: 0.22, minQty: 1, maxQty: 2 },
      { itemName: 'Flame Spessarite',  chance: 0.22, minQty: 1, maxQty: 2 },
      { itemName: 'Adamantite Powder', chance: 0.35, minQty: 1, maxQty: 2 },
    ],
  },
  // Adamantite Ore — drops uncommon TBC gems + Adamantite Powder
  {
    id: 'prospect-adamantite',
    inputItem: 'Adamantite Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Talasite',          chance: 0.12, minQty: 1, maxQty: 1 },
      { itemName: 'Nightseye',         chance: 0.12, minQty: 1, maxQty: 1 },
      { itemName: 'Dawnstone',         chance: 0.12, minQty: 1, maxQty: 1 },
      { itemName: 'Living Ruby',       chance: 0.12, minQty: 1, maxQty: 1 },
      { itemName: 'Noble Topaz',       chance: 0.12, minQty: 1, maxQty: 1 },
      { itemName: 'Star of Elune',     chance: 0.12, minQty: 1, maxQty: 1 },
      { itemName: 'Blood Garnet',      chance: 0.10, minQty: 1, maxQty: 2 },
      { itemName: 'Deep Peridot',      chance: 0.10, minQty: 1, maxQty: 2 },
      { itemName: 'Shadow Draenite',   chance: 0.10, minQty: 1, maxQty: 2 },
      { itemName: 'Golden Draenite',   chance: 0.10, minQty: 1, maxQty: 2 },
      { itemName: 'Azure Moonstone',   chance: 0.10, minQty: 1, maxQty: 2 },
      { itemName: 'Flame Spessarite',  chance: 0.10, minQty: 1, maxQty: 2 },
      { itemName: 'Adamantite Powder', chance: 0.50, minQty: 1, maxQty: 3 },
    ],
  },
  // Rich Adamantite Ore — same as Adamantite but better rates
  {
    id: 'prospect-rich-adamantite',
    inputItem: 'Adamantite Ore',  // same ore, just higher-yield node
    inputQuantityPerRoll: 5,
    possibleDrops: [
      { itemName: 'Talasite',          chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Nightseye',         chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Dawnstone',         chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Living Ruby',       chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Noble Topaz',       chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Star of Elune',     chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Adamantite Powder', chance: 0.60, minQty: 2, maxQty: 4 },
    ],
  },
]
