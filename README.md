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

## En kolay yol: Tablet + ücretsiz Render (bilgisayar yok, ücret yok)

Oyun tabletin tarayıcısında çalışır. Puanlar, kupalar ve taraftarlar tabletin hafızasında saklanır.
TikTok'tan gelen yorum ve hediyeleri ücretsiz bir bulut sunucusu (Render) **aktarır**. Sunucu sadece postacıdır, hiçbir şey saklamaz.

**Bir kerelik kurulum (tabletten, 5 dakika):**

1. [render.com](https://render.com) adresinde GitHub hesabınla ücretsiz kaydol.
2. Şu bağlantıyı aç: **https://render.com/deploy?repo=https://github.com/haydarsahin0/tiktok**
3. `RELAY_USERS` kutusuna TikTok kullanıcı adını yaz (başkaları senin sunucunu kullanamasın) → **Apply / Deploy**.
4. Birkaç dakika sonra Render sana bir adres verir, ör. `https://taraftar-ligi.onrender.com`.

**Her yayında:**

1. Tablette Render adresinin sonuna `/ayarlar.html` ekleyip aç (ör. `https://taraftar-ligi.onrender.com/ayarlar.html`).
2. TikTok kullanıcı adını yaz → **Aktarıcıyı test et** → **Kaydet**.
3. Açılan yayın ekranında Paylaş menüsü → **Ana Ekrana Ekle**.
4. TikTok → **Canlı** → **Mobil oyun / Ekran paylaşımı** → yayını başlat → Taraftar Ligi'ne geç.
5. **Rahatsız Etmeyin** modunu aç, otomatik kilidi kapat, tableti şarja tak.

Notlar:
- Render'ın ücretsiz sunucusu 15 dakika kimse kullanmayınca uyur. İlk açılışta uyanması ~1 dakika sürebilir. Yayın ekranı açıkken sunucuyu 4 dakikada bir dürterek uyanık tutar.
- Kullanıcı adına `test` yazarsan aktarıcı sahte izleyiciler gönderir. Kurulumu yayın açmadan denemek için kullanabilirsin.
- Ayarlar sayfasında test butonları da var (hediye at, turu bitir…). Yayın ekranı başka sekmede açıkken çalışırlar.
- Bağlantı sorunu olursa yayın ekranının adresine `?debug=1` ekle; gelen veriler ekranda görünür.

**Render otomatik güncellenmiyorsa:** Render'ın GitHub uygulamasının bu depoya erişimi yoksa güncellemeler gelmez. İki çözüm:
- Render → **Account Settings** → **GitHub** → **Configure** → `haydarsahin0/tiktok` deposuna erişim ver. Sonra servis → **Settings** → *Auto-Deploy*: **On Commit**.
- Ya da: Render → servis → **Settings** → **Deploy Hook** adresini kopyala → GitHub → depo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** → adı `RENDER_DEPLOY_HOOK`, değeri kopyaladığın adres. Bundan sonra her güncellemede GitHub, Render'a haber verir.
- Acil durumda: Render → servis → **Manual Deploy** → **Deploy latest commit**.

**İstersen Euler Stream ile:** Ayarlar sayfasında "Euler Stream" seçip ücretli API anahtarını yazabilirsin. Bu durumda Render gerekmez, oyun GitHub Pages'ten de açılabilir: `https://haydarsahin0.github.io/tiktok/`
(GitHub → Settings → Pages → *Deploy from a branch* → `gh-pages` / root.)

## Diğer yollar

Yol 1: Android telefonda Termux (ücretsiz, telefon hem oyunu hem bağlantıyı çalıştırır). Yol 2: kiralık sunucu, TikTok'a doğrudan yayın gönderir (cihaz gerekmez, yayın anahtarı ister).

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
3. Müzik ve efektler varsayılan olarak açık. Kapatmak için adres: `http://localhost:3000/?sound=0`

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

### Müzik ve sesler

- Arka planda kısık, özgün bir enstrümantal müzik çalar. Tarayıcıda üretilir, hazır bir şarkı değildir; telif sorunu yoktur.
- Hediye gelince yumuşak bir çan sesi çıkar. Büyük hediyelerde hafif bir tezahürat, lider değişince kısa bir boru sesi, takımlar sıralamada yükselince yumuşak bir "vınn" sesi duyulur. Efektler üst üste binmesin diye sınırlıdır; efekt çalarken müzik biraz kısılır.
- Tablette Ayarlar → **Müzik ve sesler** bölümünden müzik ve efektler ayrı ayrı açılıp kapatılabilir, ses seviyeleri ayarlanabilir.
- Tarayıcılar sesi ancak bir dokunuştan sonra açar. Yayın ekranında "Ses için ekrana dokun" yazısı çıkarsa bir kez dokun.
- iPhone'da sessiz mod açıksa ses çıkmaz. Bilgisayarda/OBS'te sesi kapatmak için adrese `?sound=0` ekle.
- Not: Kiralık sunucudan doğrudan yayın yolunda (Yol 2) şimdilik ses gönderilmiyor.

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
public/relay-client.js  tarayıcının ücretsiz aktarıcıya bağlantısı
public/audio.js arka plan müziği ve ses efektleri
src/relay.js    aktarıcı: TikTok olaylarını tablete iletir
render.yaml     Render'a tek tıkla kurulum
public/ayarlar.html  tablet ayarlar sayfası
src/server.js   web sunucusu, ekrana canlı veri gönderir
src/tiktok.js   TikTok canlı yayın bağlantısı (otomatik yeniden bağlanma)
src/streamer.js bilgisayarsız bulut yayını (sanal ekran + ffmpeg → TikTok)
deploy/         telefon (Termux) ve sunucu kurulum betikleri
Dockerfile      sunucu imajı
public/         yayın ekranı (index.html, overlay.js) ve yönetim paneli
test/           testler (npm test)
```
