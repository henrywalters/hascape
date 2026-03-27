
# ─── Build ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
 
# Build hagamets first
COPY hgts/ ./hgts/
WORKDIR /app/hgts
RUN npm install --no-package-lock && npm run build
 
# Copy hascape monorepo
WORKDIR /app
COPY hascape/package*.json ./hascape/
COPY hascape/tsconfig.base.json ./hascape/tsconfig.base.json
COPY hascape/common/package*.json ./hascape/common/
COPY hascape/client/package*.json ./hascape/client/
COPY hascape/server/package*.json ./hascape/server/
 
RUN sed -i 's|file:../../hgts|file:/app/hgts|g' /app/hascape/server/package.json
 
WORKDIR /app/hascape
RUN npm install --no-package-lock
 
WORKDIR /app
COPY hascape/common/ ./hascape/common/
COPY hascape/server/ ./hascape/server/
 
WORKDIR /app/hascape
RUN npm run build --workspace=common
RUN npm run build --workspace=server
 
# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g tsx
 
COPY --from=build /app/hascape/node_modules ./node_modules
COPY --from=build /app/hascape/package.json ./package.json
COPY --from=build /app/hascape/common/dist ./common/dist
COPY --from=build /app/hascape/common/package.json ./common/package.json
COPY --from=build /app/hascape/server/dist ./server/dist
COPY --from=build /app/hascape/server/package.json ./server/package.json
 
# Copy built hgts directly into node_modules
COPY --from=build /app/hgts/ ./node_modules/hagamets/
 
EXPOSE 4201

CMD ["npx", "tsx", "server/src/api.ts"]