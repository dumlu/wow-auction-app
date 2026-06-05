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
  // Copper Ore
  makeEntry('d1', 'Copper Ore', 300, 20, 'Miner1'),
  makeEntry('d2', 'Copper Ore', 320, 20, 'Miner2'),
  makeEntry('d3', 'Copper Ore', 280, 10, 'Miner3'),
  makeEntry('d4', 'Copper Ore', 350, 20, 'Miner4'),
  makeEntry('d5', 'Copper Ore', 290, 20, 'Miner5'),
  // Tin Ore
  makeEntry('d10', 'Tin Ore', 450, 20, 'TinMiner1'),
  makeEntry('d11', 'Tin Ore', 480, 20, 'TinMiner2'),
  makeEntry('d12', 'Tin Ore', 420, 10, 'TinMiner3'),
  makeEntry('d13', 'Tin Ore', 500, 20, 'TinMiner4'),
  // Mithril Ore
  makeEntry('d20', 'Mithril Ore', 1200, 20, 'MithrilMiner1'),
  makeEntry('d21', 'Mithril Ore', 1150, 10, 'MithrilMiner2'),
  makeEntry('d22', 'Mithril Ore', 1300, 20, 'MithrilMiner3'),
  // Shadowgem
  makeEntry('d30', 'Shadowgem', 2500, 1, 'Gem1'),
  makeEntry('d31', 'Shadowgem', 2200, 1, 'Gem2'),
  makeEntry('d32', 'Shadowgem', 3000, 1, 'Gem3'),
  // Moss Agate
  makeEntry('d40', 'Moss Agate', 1500, 1, 'GemSeller1'),
  makeEntry('d41', 'Moss Agate', 1600, 1, 'GemSeller2'),
  makeEntry('d42', 'Moss Agate', 1400, 2, 'GemSeller3'),
  // Lesser Moonstone
  makeEntry('d50', 'Lesser Moonstone', 1800, 1, 'Moon1'),
  makeEntry('d51', 'Lesser Moonstone', 1900, 1, 'Moon2'),
  makeEntry('d52', 'Lesser Moonstone', 1700, 1, 'Moon3'),
  // Malachite
  makeEntry('d60', 'Malachite', 400, 1, 'Mine1'),
  makeEntry('d61', 'Malachite', 350, 1, 'Mine2'),
  makeEntry('d62', 'Malachite', 500, 2, 'Mine3'),
  // Tigerseye
  makeEntry('d70', 'Tigerseye', 500, 1, 'Eye1'),
  makeEntry('d71', 'Tigerseye', 450, 1, 'Eye2'),
  makeEntry('d72', 'Tigerseye', 600, 1, 'Eye3'),
  // Solid Stone
  makeEntry('d80', 'Solid Stone', 80, 20, 'Stone1'),
  makeEntry('d81', 'Solid Stone', 90, 20, 'Stone2'),
  // Heavy Stone
  makeEntry('d90', 'Heavy Stone', 120, 20, 'HStone1'),
  makeEntry('d91', 'Heavy Stone', 130, 10, 'HStone2'),
  // Rough Stone
  makeEntry('d100', 'Rough Stone', 40, 20, 'RStone1'),
  makeEntry('d101', 'Rough Stone', 50, 20, 'RStone2'),
  // Copper Bar
  makeEntry('d110', 'Copper Bar', 600, 20, 'Smelter1'),
  makeEntry('d111', 'Copper Bar', 580, 10, 'Smelter2'),
  // Iron Ore
  makeEntry('d120', 'Iron Ore', 700, 20, 'IronMiner1'),
  makeEntry('d121', 'Iron Ore', 720, 20, 'IronMiner2'),
  // Iron Bar
  makeEntry('d130', 'Iron Bar', 1400, 10, 'IronSmith1'),
  makeEntry('d131', 'Iron Bar', 1500, 20, 'IronSmith2'),
  // Thorium Ore
  makeEntry('d140', 'Thorium Ore', 2500, 20, 'ThorMiner1'),
  makeEntry('d141', 'Thorium Ore', 2800, 20, 'ThorMiner2'),
]
