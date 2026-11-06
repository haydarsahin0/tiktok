# Bulut sunucusu için: oyun + (isteğe bağlı) TikTok'a doğrudan yayın
FROM node:22-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends chromium ffmpeg xvfb fonts-noto-color-emoji fonts-dejavu-core ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public

ENV NODE_ENV=production \
    PORT=3000 \
    CHROMIUM_PATH=/usr/bin/chromium
VOLUME /app/data
EXPOSE 3000
CMD ["node", "src/server.js"]
