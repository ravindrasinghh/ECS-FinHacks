FROM node:20-slim
# Use environment variable for port
ENV PORT=8080

WORKDIR /usr/src/app

COPY . .

RUN npm ci --only=production

EXPOSE ${PORT}

# Switch back to node user for security
USER node

CMD ["node", "index.js"]
