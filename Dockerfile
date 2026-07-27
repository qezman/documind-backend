FROM node:24-slim AS builder
WORKDIR /app
ENV CI=true

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false
RUN printenv NODE_ENV; ls node_modules | grep -i typescript || echo "typescript NOT installed"

COPY . .
RUN pnpm run build

FROM node:24-slim
WORKDIR /app
ENV CI=true

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./

EXPOSE 3002
CMD ["node", "dist/server.js"]