#!/usr/bin/env bash
# Kiralık sunucuya (Ubuntu/Debian) tek komutla kurulum.
# Sunucu sağlayıcının web konsolunda ya da telefondan SSH ile (ör. Termius) çalıştır:
#   bash deploy/sunucu-kurulum.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker kuruluyor..."
  curl -fsSL https://get.docker.com | sh
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo
  read -rp "TikTok kullanıcı adın (@ olmadan): " TT_USER
  echo "TikTok yayın bilgileri (LIVE Producer / Yayın anahtarı sayfasında yazar)."
  echo "Bilmiyorsan boş bırak; sonra .env dosyasına eklersin, yayın gönderilmez ama oyun çalışır."
  read -rp "Sunucu URL'si (rtmp://... ile başlar): " TT_SERVER
  read -rp "Yayın anahtarı: " TT_KEY
  TOKEN=$(head -c 12 /dev/urandom | od -An -tx1 | tr -d ' \n')
  sed -i "s|^TIKTOK_USERNAME=.*|TIKTOK_USERNAME=${TT_USER}|; s|^ADMIN_TOKEN=.*|ADMIN_TOKEN=${TOKEN}|; s|^STREAM_SERVER=.*|STREAM_SERVER=${TT_SERVER}|; s|^STREAM_KEY=.*|STREAM_KEY=${TT_KEY}|" .env
fi

docker build -t taraftar-ligi .
docker rm -f taraftar-ligi >/dev/null 2>&1 || true
docker run -d --name taraftar-ligi --restart unless-stopped \
  --env-file .env -p 80:3000 -v "$(pwd)/data:/app/data" --shm-size=512m \
  taraftar-ligi

IP=$(curl -fsS https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
TOKEN=$(grep '^ADMIN_TOKEN=' .env | cut -d= -f2)
echo
echo "✅ Kuruldu ve 7/24 çalışıyor (sunucu yeniden başlasa da kendiliğinden açılır)."
echo "   Yayın ekranı : http://${IP}/"
echo "   Yönetim      : http://${IP}/admin.html?token=${TOKEN}"
echo "   Kayıtlar     : docker logs -f taraftar-ligi"
echo "   Ayar değiştirmek için .env dosyasını düzenleyip bu betiği tekrar çalıştır."
