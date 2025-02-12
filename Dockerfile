FROM node:20-slim
# Use environment variable for port
ENV PORT=8080

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

EXPOSE ${PORT}

# Switch back to node user for security
USER node

CMD ["node", "index.js"]
