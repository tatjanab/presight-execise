# Build the API and the client
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci
COPY client client
COPY server server
RUN npm run build

# API: seeds the database on first start (prestart), then serves on :4000
FROM node:22-alpine AS server
WORKDIR /app
ENV NODE_ENV=production PORT=4000 DATABASE_PATH=/data/directory.db
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --omit=dev -w presight-server
COPY --from=build /app/server/dist server/dist
EXPOSE 4000
CMD ["npm", "start", "-w", "presight-server"]

# Client: static files served by nginx, which proxies /api to the API
FROM nginx:1.27-alpine AS client
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
