FROM node:20-slim

WORKDIR /usr/src/app

# Switch to root user for installation
USER root

# Install htop
RUN apt-get update && \
    apt-get install -y htop && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm ci --only=production

COPY . .

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:8080/container', (res) => res.statusCode === 200 ? process.exit(0) : process.exit(1))"

EXPOSE 8080

# Switch back to node user for security
USER node

CMD ["node", "index.js"]
