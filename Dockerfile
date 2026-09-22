FROM node:22-bookworm-slim AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci

FROM base AS server-build
COPY server/tsconfig.json server/tsconfig.json
COPY server/src server/src
RUN npm run build -w presight-server

FROM node:22-bookworm-slim AS server
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_PATH=/data/directory.db
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci --omit=dev
COPY --from=server-build /app/server/dist server/dist
RUN mkdir -p /data
EXPOSE 4000
CMD ["node", "server/dist/index.js"]

FROM base AS client-build
COPY client client
RUN npm run build -w presight-client

FROM nginx:1.27-alpine AS client
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=client-build /app/client/dist /usr/share/nginx/html
EXPOSE 80
