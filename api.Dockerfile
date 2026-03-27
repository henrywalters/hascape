# ─── Build ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
 
# Copy hagamets first
COPY hgts/ ./hgts/
 
# Copy hascape monorepo package files + tsconfig
COPY hascape/package*.json ./hascape/
COPY hascape/tsconfig.base.json ./hascape/tsconfig.base.json
COPY hascape/common/package*.json ./hascape/common/
COPY hascape/client/package*.json ./hascape/client/
COPY hascape/server/package*.json ./hascape/server/
 
# Fix the file: path to match Docker's structure
RUN sed -i 's|file:../../hgts|file:/app/hgts|g' /app/hascape/server/package.json
 
WORKDIR /app/hascape
RUN npm install --no-package-lock
 
# Copy all source after install
WORKDIR /app
COPY hascape/common/ ./hascape/common/
COPY hascape/server/ ./hascape/server/
 
WORKDIR /app/hascape
RUN npm run build --workspace=common
 
# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
 
COPY --from=build /app/hgts/ ./hgts/
COPY --from=build /app/hascape/node_modules ./node_modules
COPY --from=build /app/hascape/package.json ./package.json
COPY --from=build /app/hascape/common/dist ./common/dist
COPY --from=build /app/hascape/common/package.json ./common/package.json
COPY --from=build /app/hascape/server/ ./server/

COPY --from=build /app/hgts/ ./node_modules/hagamets/
 
EXPOSE 4201

CMD ["npx", "tsx", "server/src/api.ts"]