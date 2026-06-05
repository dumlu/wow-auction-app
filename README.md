# WoW Auction Analyzer

World of Warcraft TBC/Classic için Auctionator verisi tabanlı profession leveling, reagent maliyet ve prospecting analiz uygulaması.

## Kurulum

```bash
cd wow-auction-app
npm install
npm run dev
```

Tarayıcıda: http://localhost:5173

## Auctionator LUA Import

1. WoW klasöründen `WTF/Account/<isim>/SavedVariables/Auctionator.lua` dosyasını al
2. Uygulamada **Auction Import** sayfasına git
3. Dosyayı sürükle-bırak veya "browse" ile seç

**TSV Alternatifi:**
```
item	unit price	quantity	seller
Copper Ore	300	20	Miner1
```

## tweakcn Tema

1. tweakcn.com'dan tema CSS'ini kopyala
2. **Theme Settings** → textarea'ya yapıştır → "Apply & Save"

## Profession Leveling

Profession + başlangıç/hedef skill seç → Calculate → adım adım maliyet planı

## Bilinen Limitler

- Auctionator v8 PRICE_DATABASE binary; tam decode olmayabilir → TSV kullan
- Backend yok, localStorage (≈5MB limit)
- Leveling algoritması basit greedy
