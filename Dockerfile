FROM node:20-slim

WORKDIR /usr/src/app

RUN npm ci --only=production

COPY . .

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:8080/container', (res) => res.statusCode === 200 ? process.exit(0) : process.exit(1))"

EXPOSE 8080

USER node

CMD ["node", "index.js"]
