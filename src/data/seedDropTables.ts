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
  // Data based on TBC Classic community benchmarks (Wowhead/Wow-Professions)
  {
    id: 'prospect-fel-iron',
    inputItem: 'Fel Iron Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      // Common Gems (~18% each)
      { itemName: 'Blood Garnet',      chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Deep Peridot',      chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Shadow Draenite',   chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Golden Draenite',   chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Azure Moonstone',   chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Flame Spessarite',  chance: 0.18, minQty: 1, maxQty: 2 },
      // Rare Gems (~1.3% each, ~7.8% total)
      { itemName: 'Living Ruby',       chance: 0.013, minQty: 1, maxQty: 1 },
      { itemName: 'Noble Topaz',       chance: 0.013, minQty: 1, maxQty: 1 },
      { itemName: 'Dawnstone',         chance: 0.013, minQty: 1, maxQty: 1 },
      { itemName: 'Nightseye',         chance: 0.013, minQty: 1, maxQty: 1 },
      { itemName: 'Star of Elune',     chance: 0.013, minQty: 1, maxQty: 1 },
      { itemName: 'Talasite',          chance: 0.013, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'prospect-adamantite',
    inputItem: 'Adamantite Ore',
    inputQuantityPerRoll: 5,
    possibleDrops: [
      // Uncommon Gems (~18% each, usually 1-2 per prospect)
      { itemName: 'Blood Garnet',      chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Deep Peridot',      chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Shadow Draenite',   chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Golden Draenite',   chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Azure Moonstone',   chance: 0.18, minQty: 1, maxQty: 2 },
      { itemName: 'Flame Spessarite',  chance: 0.18, minQty: 1, maxQty: 2 },
      // Rare Gems (~4% each, ~24% total)
      { itemName: 'Living Ruby',       chance: 0.04, minQty: 1, maxQty: 1 },
      { itemName: 'Noble Topaz',       chance: 0.04, minQty: 1, maxQty: 1 },
      { itemName: 'Dawnstone',         chance: 0.04, minQty: 1, maxQty: 1 },
      { itemName: 'Nightseye',         chance: 0.04, minQty: 1, maxQty: 1 },
      { itemName: 'Star of Elune',     chance: 0.04, minQty: 1, maxQty: 1 },
      { itemName: 'Talasite',          chance: 0.04, minQty: 1, maxQty: 1 },
      // Guaranteed/High chance powder
      { itemName: 'Adamantite Powder', chance: 1.00, minQty: 1, maxQty: 1 },
    ],
  },
]
