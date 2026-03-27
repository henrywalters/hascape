# ─── Build ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Copy hagamets (local dependency)
COPY hgts/ ./hgts/

# Copy hascape monorepo
COPY hascape/package*.json ./hascape/
COPY hascape/common/package*.json ./hascape/common/
COPY hascape/client/package*.json ./hascape/client/
COPY hascape/server/package*.json ./hascape/server/

WORKDIR /app/hascape
RUN npm install --no-package-lock

WORKDIR /app
COPY hascape/common/ ./hascape/common/
COPY hascape/server/ ./hascape/server/

WORKDIR /app/hascape
RUN npm run build --workspace=common

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/hascape/node_modules ./node_modules
COPY --from=build /app/hascape/package.json ./package.json
COPY --from=build /app/hascape/common/dist ./common/dist
COPY --from=build /app/hascape/common/package.json ./common/package.json
COPY --from=build /app/hascape/server/ ./server/

EXPOSE 4201

CMD ["node_modules/.bin/tsx", "server/api.ts"]