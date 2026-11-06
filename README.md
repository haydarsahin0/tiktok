# ⚽ Taraftar Ligi — TikTok Canlı Yayın Oyunu

İzleyiciler yoruma **takımının adını ya da plakasını** yazar, taraftar olur ve stadyumun etrafında yerini alır.
Hediye attıkça, beğendikçe takımının forması yükselir. Tur bitince en yüksekteki takım **şampiyon** olur ve kupa kazanır.
Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor'un yanında Sivas'tan Amed'e, Bursa'dan Erzurum'a **50 Türk kulübü** var.

![ekran](docs/ekran.png)

## Nasıl oynanır (izleyici gözünden)

| İzleyici ne yapar | Ne olur |
|---|---|
| Yoruma `trabzon`, `ts`, `61`, `cimbom`, `fener`, `sivas`, `58`, `amed`… yazar | O takımın taraftarı olur, stadyumda profil fotoğrafıyla belirir (+10 puan) |
| Hediye atar | 1 jeton = 100 puan takımına gider, ekranda “GOL!” ve kart çıkar |
| Beğenir | Her beğeni 1 puan |
| Takip eder / paylaşır | +50 puan |
| Takımı yokken hediye atar | Puan bekletilir, takımını yazınca eklenir |
| Başka takıma geçmek ister | Sadece yeni takımın adını yazar (ör. `gs`) — “transfer” olur |

- Lider değişince ekranda **“ZİRVE DEĞİŞTİ!”** çıkar.
- Tur süresi dolunca (varsayılan 60 dk) şampiyon ekranı gelir, takımın kupa sayısı artar, puanlar sıfırlanır, yeni tur başlar.
- Kupalar, taraftarların takımı ve devam eden tur `data/state.json` dosyasına kaydedilir. Program kapanıp açılsa da kaldığı yerden devam eder.

## Kurulum

1. [Node.js](https://nodejs.org) 20.12 veya üstünü kur (LTS sürümü yeterli).
2. Bu klasörde:

```bash
npm install
```

3. Önce demo ile dene (sahte izleyiciler hediye atar):

```bash
npm run demo
```

Tarayıcıda `http://localhost:3000` aç. Test paneli: `http://localhost:3000/admin.html`

4. Gerçek yayın için `.env.example` dosyasını `.env` adıyla kopyala, `TIKTOK_USERNAME` satırına kullanıcı adını yaz ve başlat:

```bash
npm start
```

## Yayına ekleme

**TikTok LIVE Studio** (bilgisayardan yayın):
1. Dikey (portre) sahne seç.
2. Kaynak ekle → **Link / Web sayfası** → `http://localhost:3000` → boyut **1080 x 1920**.
3. Sesli efekt istersen adresi `http://localhost:3000/?sound=1` yap.

**OBS** (TikTok yayın anahtarın varsa): Kaynak → **Tarayıcı** → URL `http://localhost:3000`, genişlik 1080, yükseklik 1920.
Arkada kamera göstermek istersen `?transparent=1` ekle, arka plan şeffaf olur.

Program TikTok'a bağlanamazsa (yayın henüz açık değilse) 30 saniyede bir tekrar dener; yayını açtığında kendiliğinden bağlanır.
Ekranın üstünde bağlantı durumu yazar (bağlıyken kaybolur).

## 7/24 yayın için

- Bilgisayar uyku moduna geçmesin (Güç ayarları → Uyku: Hiçbir zaman).
- Programı çökse bile yeniden başlatan bir araçla çalıştır:

```bash
npm install -g pm2
```

```bash
pm2 start src/server.js --name taraftar-ligi
```

```bash
pm2 save
```

- `.env` içine `EULER_API_KEY` koy. Bağlantı ücretsiz imza sunucusuyla da çalışır ama sürekli yayında limit aşımı olabilir.
- TikTok kuralları: Canlı yayın için TikTok'un LIVE şartlarını (takipçi sayısı, yaş, hediye alma izni) sağlaman gerekir.
  Uzun süre başında kimse olmayan, sürekli aynı görüntüyü veren yayınlar TikTok tarafından kısıtlanabilir; ara ara yayına katılıp sohbet etmek yayının sağlığı için iyi olur.

## Ayarlar

`.env` dosyasında:

| Ayar | Varsayılan | Açıklama |
|---|---|---|
| `ROUND_MINUTES` | 60 | Tur süresi (dk). `0` = tur hiç bitmez |
| `CHAMPION_SECONDS` | 15 | Şampiyon ekranı süresi |
| `POINTS_PER_COIN` | 100 | 1 jeton kaç puan |
| `POINTS_PER_LIKE` | 1 | Beğeni puanı |
| `POINTS_PER_FOLLOW` / `POINTS_PER_SHARE` | 50 | Takip / paylaşım puanı |
| `POINTS_PER_JOIN` | 10 | Turda ilk kez takımını yazana |
| `ADMIN_TOKEN` | boş | Yönetim paneli şifresi |

### Takım eklemek / renk değiştirmek

`src/teams.js` dosyasını aç. Her satır bir takım:

```js
{ id: 'sivas', name: 'Sivasspor', short: 'SİVAS', code: 'SVS', colors: ['#D7182A', '#FFFFFF'], aliases: ['sivasspor', 'sivas', 'yigido'], plate: '58' },
```

- `aliases`: yoruma yazılınca bu takıma katılınır (Türkçe karakter fark etmez: `goztepe` = `Göztepe`).
- `plate`: sadece plaka yazılınca katılım. İstanbul, İzmir, Ankara, Adana gibi birden fazla büyük takımı olan şehirlere plaka verilmedi.
- `id`'yi sonradan değiştirme, kayıtlı kupalar ona bağlı.

Ekranda kulüp logoları kullanılmıyor (telif/marka sorunu olmasın diye); takımlar forma renkleri ve kısaltmalarıyla gösteriliyor.

## Yönetim paneli

`http://localhost:3000/admin.html`:
- Test yorumu, hediye, beğeni gönderme (yayından önce ekranı denemek için)
- Turu hemen bitirip şampiyon ilan etme, turu sıfırlama
- Canlı puan tablosu ve bağlantı durumu

## Dosyalar

```
src/server.js   web sunucusu, ekrana canlı veri gönderir
src/tiktok.js   TikTok canlı yayın bağlantısı (otomatik yeniden bağlanma)
src/game.js     puanlar, turlar, şampiyonluklar, kayıt
src/teams.js    takım listesi
src/demo.js     sahte izleyiciler
public/         yayın ekranı (index.html, overlay.js) ve yönetim paneli
test/           testler (npm test)
```
