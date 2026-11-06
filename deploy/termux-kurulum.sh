#!/data/data/com.termux/files/usr/bin/bash
# Android telefonda (Termux uygulaması) kurulum. Termux'u F-Droid'den indir, sonra:
#   pkg install -y git && git clone https://github.com/haydarsahin0/tiktok && cd tiktok && bash deploy/termux-kurulum.sh
set -euo pipefail
cd "$(dirname "$0")/.."

pkg update -y
pkg install -y nodejs-lts
npm install --omit=dev

if [ ! -f .env ]; then
  cp .env.example .env
  read -rp "TikTok kullanıcı adın (@ olmadan, boş = demo): " TT_USER
  sed -i "s|^TIKTOK_USERNAME=.*|TIKTOK_USERNAME=${TT_USER}|" .env
fi

# Telefon ekranı kapansa da Termux arka planda çalışmaya devam etsin
termux-wake-lock 2>/dev/null || true

echo
echo "✅ Hazır. Chrome'da http://localhost:3000 adresini aç, sonra TikTok'tan ekran paylaşımıyla yayına geç."
echo "   Bir dahaki sefere başlatmak için: cd tiktok && npm start"
echo
npm start
