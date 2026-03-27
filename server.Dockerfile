# ─── Build ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY common/package*.json ./common/
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm install

COPY . .

RUN npm run build --workspace=common && \
    npm run build --workspace=server

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/common/dist ./common/dist
COPY --from=build /app/common/package.json ./common/package.json
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/package.json

EXPOSE 3000

# Adjust to your compiled entrypoint
CMD ["node", "server/dist/server.js"]