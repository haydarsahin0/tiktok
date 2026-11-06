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

## En kolay yol: Tablet / telefon + GitHub Pages (kurulum yok)

Oyun tamamen tarayıcının içinde çalışır. Sunucu, bilgisayar ya da uygulama kurmak gerekmez.
Puanlar, kupalar ve taraftarlar tabletin kendi hafızasında saklanır.

**Bir kerelik hazırlık:**

1. **GitHub Pages'i aç:** GitHub'da bu depoyu aç → **Settings** → **Pages** → *Source* kısmında **GitHub Actions** seç.
   Sonra **Actions** sekmesi → **GitHub Pages** → **Run workflow**. Bir dakika sonra site yayında:
   `https://haydarsahin0.github.io/tiktok/`
2. **Euler Stream hesabı aç:** [eulerstream.com](https://www.eulerstream.com) → kaydol → **API Key** oluştur.
   Tarayıcı TikTok'a doğrudan bağlanamadığı için yorum ve hediyeler bu servis üzerinden gelir.
   Euler ücretli bir servis; deneme ya da küçük bir plan olup olmadığını sitesinden kontrol et.

**Her yayında:**

1. Tablette `https://haydarsahin0.github.io/tiktok/ayarlar.html` aç, TikTok kullanıcı adını ve API anahtarını yaz → **Kaydet**.
2. Açılan yayın ekranında Paylaş menüsü → **Ana Ekrana Ekle** (sonraki seferlerde direkt bu simgeden açarsın, tam ekran olur).
3. TikTok → **Canlı** → **Mobil oyun / Ekran paylaşımı** → yayını başlat → Taraftar Ligi'ne geç.
4. **Rahatsız Etmeyin** modunu aç, tableti şarja tak. Ekran yayın boyunca kapanmaz.

Ayarlar sayfasında test butonları da var (hediye at, turu bitir…). Yayın ekranı başka sekmede açıkken çalışırlar.
Bağlantı sorunu olursa yayın ekranının adresine `?debug=1` ekle; TikTok'tan gelen veriler ekranda görünür.

## Diğer yollar (Euler Stream olmadan)

Euler Stream kullanmak istemezsen: Yol 1 (Android telefonda Termux, ücretsiz) ya da Yol 2 (kiralık sunucu, cihaz gerekmez).

| | Yol 1: Sadece telefon | Yol 2: Kiralık bulut sunucu |
|---|---|---|
| Maliyet | Ücretsiz | Aylık yaklaşık 5–15 € / $ |
| Gereken | Android telefon (yayına ayrılmış eski bir telefon ideal), şarj aleti, Wi-Fi | TikTok **yayın anahtarı** (stream key) + kiralık sunucu |
| 7/24 | Telefon sürekli açık ve şarjda kalmalı | Hiçbir cihaz açık kalmaz, sunucu yayını kendisi yapar |
| Nasıl yayına çıkar | TikTok uygulamasında **ekran paylaşımı** (mobil oyun yayını) | Sunucu görüntüyü doğrudan TikTok'a gönderir |

### Yol 1: Sadece telefonla (Android)

Oyun telefonun içinde çalışır, sen TikTok'tan ekranını paylaşarak yayına çıkarsın.

1. **Termux** uygulamasını **F-Droid**'den indir (Play Store'daki sürümü eski, onu kullanma).
2. Termux'u aç, şu komutu yapıştır:

```bash
pkg install -y git && git clone https://github.com/haydarsahin0/tiktok && cd tiktok && bash deploy/termux-kurulum.sh
```

3. Kurulum TikTok kullanıcı adını sorar, sonra oyunu başlatır. Termux'u kapatma, arka planda açık kalsın.
4. Chrome'da `http://localhost:3000` aç → sağ üstteki menü → **Ana ekrana ekle**. Artık telefonunda "Taraftar Ligi" uygulaması var, ona dokununca tam ekran açılır.
5. TikTok → **Canlı** → **Mobil oyun / Ekran paylaşımı** seçeneğini seç, yayına başla, sonra Taraftar Ligi uygulamasına geç.

Yayın sırasında dikkat:
- **Rahatsız Etmeyin** modunu aç, yoksa gelen bildirimler yayında görünür.
- Ayarlar → Pil → Termux ve Chrome için **pil optimizasyonunu kapat** (Android arka planda kapatmasın).
- Telefon şarja takılı, serin bir yerde dursun. Kılıfı çıkarmak ısınmayı azaltır.
- Bir dahaki sefere başlatmak için Termux'ta: `cd tiktok && npm start`

**iPhone kullanıyorsan:** iPhone'da Termux yok. Oyunu Yol 2'deki gibi bir sunucuda çalıştır (yayın anahtarı boş kalabilir), iPhone'da Safari ile sunucunun adresini aç → Paylaş → **Ana Ekrana Ekle**, sonra TikTok'tan ekran paylaşımıyla yayına çık.

### Yol 2: Tamamen bulutta (cihaz gerekmez)

Kiralık bir sunucu oyunu kendi içindeki görünmez bir ekranda çalıştırır ve görüntüyü 7/24 doğrudan TikTok'a gönderir. Telefonun kapalı olabilir.

1. **Yayın anahtarın var mı kontrol et:** Bilgisayar sitesindeki TikTok LIVE bölümünde (LIVE Producer / LIVE Center) "Sunucu URL'si" ve "Yayın anahtarı" görünüyorsa bu yol sana uygun. TikTok bunu her hesaba vermiyor. Görünmüyorsa şimdilik Yol 1 ile devam et.
2. **Sunucu kirala:** Hetzner, Contabo, DigitalOcean gibi bir firmadan **Ubuntu**, en az **2–4 çekirdek, 4 GB RAM** sunucu al. Telefondan kaydolabilirsin.
3. Sunucu firmasının sitesindeki **Konsol** düğmesine bas (ya da telefona **Termius** uygulamasını kurup bağlan) ve şunu yapıştır:

```bash
git clone https://github.com/haydarsahin0/tiktok && cd tiktok && bash deploy/sunucu-kurulum.sh
```

4. Betik TikTok kullanıcı adını, sunucu URL'sini ve yayın anahtarını sorar. Bitince yayın ekranının ve yönetim panelinin adresini yazar (yönetim adresini kimseyle paylaşma).
5. Sunucu yeniden başlasa da oyun ve yayın kendiliğinden açılır. Görüntü kayarsa `.env` dosyasında `STREAM_WIDTH=540`, `STREAM_HEIGHT=960`, `STREAM_BITRATE=2000k` yapıp betiği tekrar çalıştır.

## Kurulum (bilgisayarın varsa)

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

`public/core/teams.js` dosyasını aç (GitHub sitesinde dosyayı açıp kalem simgesiyle tabletten de düzenleyebilirsin). Her satır bir takım:

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
public/core/     oyun mantığı ve takım listesi (tarayıcı ve sunucu ortak kullanır)
public/local.js sunucusuz mod (GitHub Pages / tablet)
public/euler.js tarayıcıdan TikTok bağlantısı (Euler Stream)
public/ayarlar.html  tablet ayarlar sayfası
src/server.js   web sunucusu, ekrana canlı veri gönderir
src/tiktok.js   TikTok canlı yayın bağlantısı (otomatik yeniden bağlanma)
src/streamer.js bilgisayarsız bulut yayını (sanal ekran + ffmpeg → TikTok)
deploy/         telefon (Termux) ve sunucu kurulum betikleri
Dockerfile      sunucu imajı
public/         yayın ekranı (index.html, overlay.js) ve yönetim paneli
test/           testler (npm test)
```
