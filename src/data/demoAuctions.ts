import type { AuctionEntry } from '@/types/auction'

function makeEntry(id: string, itemName: string, unitPrice: number, qty: number, seller: string): AuctionEntry {
  return {
    id,
    itemName,
    quantity: qty,
    buyoutPrice: unitPrice * qty,
    unitPrice,
    seller,
    timeLeft: '12:00:00',
    scanDate: new Date().toISOString(),
  }
}

export const DEMO_AUCTIONS: AuctionEntry[] = [
  // ── Vanilla Ores ──────────────────────────────────────────────
  makeEntry('d1',   'Copper Ore',   300, 20, 'Miner1'),
  makeEntry('d2',   'Copper Ore',   320, 20, 'Miner2'),
  makeEntry('d3',   'Copper Ore',   280, 10, 'Miner3'),
  makeEntry('d4',   'Tin Ore',      450, 20, 'TinMiner1'),
  makeEntry('d5',   'Tin Ore',      480, 20, 'TinMiner2'),
  makeEntry('d6',   'Iron Ore',     700, 20, 'IronMiner1'),
  makeEntry('d7',   'Iron Ore',     720, 20, 'IronMiner2'),
  makeEntry('d8',   'Mithril Ore', 1200, 20, 'MithrilMiner1'),
  makeEntry('d9',   'Mithril Ore', 1150, 10, 'MithrilMiner2'),
  makeEntry('d10',  'Thorium Ore', 2500, 20, 'ThorMiner1'),
  makeEntry('d11',  'Thorium Ore', 2800, 20, 'ThorMiner2'),

  // ── Vanilla Bars ──────────────────────────────────────────────
  makeEntry('d20',  'Copper Bar',    600, 20, 'Smelter1'),
  makeEntry('d21',  'Iron Bar',     1400, 10, 'IronSmith1'),
  makeEntry('d22',  'Mithril Bar',  2200, 10, 'MithSmith1'),
  makeEntry('d23',  'Thorium Bar',  4000, 10, 'ThorSmith1'),
  makeEntry('d24',  'Truesilver Bar', 5000, 5, 'Silver1'),

  // ── Vanilla Stones ────────────────────────────────────────────
  makeEntry('d30',  'Rough Stone',    40, 20, 'RStone1'),
  makeEntry('d31',  'Heavy Stone',   120, 20, 'HStone1'),
  makeEntry('d32',  'Solid Stone',    80, 20, 'Stone1'),

  // ── Vanilla Gems ──────────────────────────────────────────────
  makeEntry('d40',  'Tigerseye',      500, 1, 'Eye1'),
  makeEntry('d41',  'Tigerseye',      450, 1, 'Eye2'),
  makeEntry('d42',  'Malachite',      400, 1, 'Mine1'),
  makeEntry('d43',  'Shadowgem',     2500, 1, 'Gem1'),
  makeEntry('d44',  'Shadowgem',     2200, 1, 'Gem2'),
  makeEntry('d45',  'Moss Agate',    1500, 1, 'GemSeller1'),
  makeEntry('d46',  'Moss Agate',    1600, 1, 'GemSeller2'),
  makeEntry('d47',  'Lesser Moonstone', 1800, 1, 'Moon1'),
  makeEntry('d48',  'Citrine',       3500, 1, 'Cit1'),
  makeEntry('d49',  'Aquamarine',    8000, 1, 'Aqua1'),
  makeEntry('d50',  'Star Ruby',    12000, 1, 'Ruby1'),
  makeEntry('d51',  'Large Opal',   15000, 1, 'Opal1'),
  makeEntry('d52',  'Huge Emerald', 20000, 1, 'Emer1'),
  makeEntry('d53',  'Azerothian Diamond', 25000, 1, 'Dia1'),
  makeEntry('d54',  'Flask of Mojo',  800, 5, 'Mojo1'),

  // ── Vanilla Herbs ─────────────────────────────────────────────
  makeEntry('d60',  'Peacebloom',     150, 20, 'Herb1'),
  makeEntry('d61',  'Silverleaf',     120, 20, 'Herb2'),
  makeEntry('d62',  'Briarthorn',     200, 20, 'Herb3'),
  makeEntry('d63',  'Bruiseweed',     180, 20, 'Herb4'),
  makeEntry('d64',  'Mageroyal',      250, 20, 'Herb5'),
  makeEntry('d65',  'Stranglekelp',   300, 20, 'Herb6'),
  makeEntry('d66',  'Liferoot',       400, 20, 'Herb7'),
  makeEntry('d67',  'Kingsblood',     450, 20, 'Herb8'),
  makeEntry('d68',  'Goldthorn',      600, 20, 'Herb9'),
  makeEntry('d69',  'Wild Steelbloom',350, 20, 'Herb10'),
  makeEntry('d70',  'Sungrass',      1000, 20, 'Herb11'),
  makeEntry('d71',  "Khadgar's Whisker", 900, 20, 'Herb12'),
  makeEntry('d72',  'Blindweed',      800, 20, 'Herb13'),
  makeEntry('d73',  'Gromsblood',    1200, 20, 'Herb14'),
  makeEntry('d74',  'Dreamfoil',     1500, 20, 'Herb15'),
  makeEntry('d75',  'Plaguebloom',   1400, 20, 'Herb16'),
  makeEntry('d76',  'Golden Sansam', 2000, 20, 'Herb17'),
  makeEntry('d77',  'Mountain Silversage', 2200, 20, 'Herb18'),

  // ── Vanilla Potions/Vials ─────────────────────────────────────
  makeEntry('d80',  'Empty Vial',      10, 20, 'Vendor1'),
  makeEntry('d81',  'Leaded Vial',     20, 20, 'Vendor2'),
  makeEntry('d82',  'Crystal Vial',    50, 20, 'Vendor3'),

  // ── TBC Ores & Bars ───────────────────────────────────────────
  makeEntry('t1',   'Fel Iron Ore',   4500, 20, 'TBCMiner1'),
  makeEntry('t2',   'Fel Iron Ore',   4800, 20, 'TBCMiner2'),
  makeEntry('t3',   'Fel Iron Ore',   4200, 10, 'TBCMiner3'),
  makeEntry('t4',   'Adamantite Ore', 8000, 20, 'TBCMiner4'),
  makeEntry('t5',   'Adamantite Ore', 8500, 20, 'TBCMiner5'),
  makeEntry('t6',   'Adamantite Ore', 7500, 10, 'TBCMiner6'),
  makeEntry('t7',   'Fel Iron Bar',   9000, 10, 'TBCSmith1'),
  makeEntry('t8',   'Adamantite Bar', 16000, 10, 'TBCSmith2'),
  makeEntry('t9',   'Eternium Ore',  12000, 20, 'TBCMiner7'),

  // ── TBC Common Gems ───────────────────────────────────────────
  makeEntry('t20',  'Blood Garnet',     3000, 1, 'TBCGem1'),
  makeEntry('t21',  'Blood Garnet',     2800, 1, 'TBCGem2'),
  makeEntry('t22',  'Deep Peridot',     2500, 1, 'TBCGem3'),
  makeEntry('t23',  'Deep Peridot',     2700, 1, 'TBCGem4'),
  makeEntry('t24',  'Shadow Draenite',  2200, 1, 'TBCGem5'),
  makeEntry('t25',  'Shadow Draenite',  2400, 1, 'TBCGem6'),
  makeEntry('t26',  'Golden Draenite',  2000, 1, 'TBCGem7'),
  makeEntry('t27',  'Golden Draenite',  2200, 1, 'TBCGem8'),
  makeEntry('t28',  'Azure Moonstone',  2300, 1, 'TBCGem9'),
  makeEntry('t29',  'Azure Moonstone',  2100, 1, 'TBCGem10'),
  makeEntry('t30',  'Flame Spessarite', 2600, 1, 'TBCGem11'),
  makeEntry('t31',  'Flame Spessarite', 2400, 1, 'TBCGem12'),

  // ── TBC Uncommon Gems ─────────────────────────────────────────
  makeEntry('t40',  'Living Ruby',    35000, 1, 'TBCRare1'),
  makeEntry('t41',  'Living Ruby',    33000, 1, 'TBCRare2'),
  makeEntry('t42',  'Dawnstone',      28000, 1, 'TBCRare3'),
  makeEntry('t43',  'Dawnstone',      26000, 1, 'TBCRare4'),
  makeEntry('t44',  'Talasite',       22000, 1, 'TBCRare5'),
  makeEntry('t45',  'Talasite',       20000, 1, 'TBCRare6'),
  makeEntry('t46',  'Nightseye',      30000, 1, 'TBCRare7'),
  makeEntry('t47',  'Nightseye',      28000, 1, 'TBCRare8'),
  makeEntry('t48',  'Noble Topaz',    25000, 1, 'TBCRare9'),
  makeEntry('t49',  'Noble Topaz',    23000, 1, 'TBCRare10'),
  makeEntry('t50',  'Star of Elune',  27000, 1, 'TBCRare11'),
  makeEntry('t51',  'Star of Elune',  25000, 1, 'TBCRare12'),

  // ── TBC Herbs ─────────────────────────────────────────────────
  makeEntry('t60',  'Felweed',         800, 20, 'TBCHerb1'),
  makeEntry('t61',  'Felweed',         850, 20, 'TBCHerb2'),
  makeEntry('t62',  'Dreaming Glory', 1200, 20, 'TBCHerb3'),
  makeEntry('t63',  'Dreaming Glory', 1300, 20, 'TBCHerb4'),
  makeEntry('t64',  'Ragveil',        1000, 20, 'TBCHerb5'),
  makeEntry('t65',  'Terocone',       2000, 20, 'TBCHerb6'),
  makeEntry('t66',  'Ancient Lichen', 1500, 20, 'TBCHerb7'),
  makeEntry('t67',  'Netherbloom',    2500, 20, 'TBCHerb8'),
  makeEntry('t68',  'Nightmare Vine', 3000, 20, 'TBCHerb9'),
  makeEntry('t69',  'Mana Thistle',   5000, 20, 'TBCHerb10'),

  // ── TBC Primals & Motes ───────────────────────────────────────
  makeEntry('t80',  'Primal Fire',   80000, 1, 'Primal1'),
  makeEntry('t81',  'Primal Fire',   85000, 1, 'Primal2'),
  makeEntry('t82',  'Primal Water',  70000, 1, 'Primal3'),
  makeEntry('t83',  'Primal Water',  75000, 1, 'Primal4'),
  makeEntry('t84',  'Primal Earth',  30000, 1, 'Primal5'),
  makeEntry('t85',  'Primal Earth',  32000, 1, 'Primal6'),
  makeEntry('t86',  'Primal Air',    90000, 1, 'Primal7'),
  makeEntry('t87',  'Primal Air',    95000, 1, 'Primal8'),
  makeEntry('t88',  'Primal Mana',   50000, 1, 'Primal9'),
  makeEntry('t89',  'Primal Life',   40000, 1, 'Primal10'),
  makeEntry('t90',  'Mote of Fire',   8000, 1, 'Mote1'),
  makeEntry('t91',  'Mote of Water',  7000, 1, 'Mote2'),
  makeEntry('t92',  'Mote of Earth',  3000, 1, 'Mote3'),
  makeEntry('t93',  'Mote of Air',    9000, 1, 'Mote4'),
  makeEntry('t94',  'Mote of Mana',   5000, 1, 'Mote5'),

  // ── TBC Cloth & Leather ───────────────────────────────────────
  makeEntry('t100', 'Netherweave Cloth',      500, 20, 'TBCCloth1'),
  makeEntry('t101', 'Netherweave Cloth',      480, 20, 'TBCCloth2'),
  makeEntry('t102', 'Bolt of Netherweave',   2000,  5, 'TBCCloth3'),
  makeEntry('t103', 'Knothide Leather',       800, 20, 'TBCLeather1'),
  makeEntry('t104', 'Heavy Knothide Leather',3200,  5, 'TBCLeather2'),

  // ── TBC Misc Crafting ─────────────────────────────────────────
  makeEntry('t110', 'Adamantite Powder',     1500,  5, 'TBCPowder1'),
  makeEntry('t111', 'Adamantite Powder',     1600,  5, 'TBCPowder2'),
  makeEntry('t112', 'Primal Might',        350000,  1, 'TBCCraft1'),
  makeEntry('t113', 'Imbued Vial',             80, 20, 'TBCVial1'),
  makeEntry('t114', 'Shadow Pearl',         15000,  1, 'TBCPearl1'),
  makeEntry('t115', 'Purified Draenic Water',  500, 5, 'TBCWater1'),
]
