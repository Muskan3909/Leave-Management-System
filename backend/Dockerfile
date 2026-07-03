# --- Backend: Node.js + Express API ---
FROM node:22-alpine

WORKDIR /app

# Install dependencies first so this layer is cached unless package*.json changes
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy source
COPY src ./src

# SQLite file lives here at runtime; keep it out of the image and mount a
# volume in docker-compose so data survives container restarts.
RUN mkdir -p database

EXPOSE 5000

CMD ["node", "src/server.js"]
