FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./server.js
COPY openlist.js ./openlist.js

EXPOSE 8000

CMD ["node", "server.js"]
