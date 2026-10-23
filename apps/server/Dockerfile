FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/client/package.json apps/client/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN npm ci
COPY packages/contracts packages/contracts
COPY apps/server apps/server
RUN npm run build -w @people/contracts && npm run build -w @people/server

FROM denoland/deno:alpine-2.5.6
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/contracts ./packages/contracts
COPY --from=build /app/apps/server ./apps/server
COPY deno.json package.json ./
USER deno
WORKDIR /app/apps/server
EXPOSE 3000
CMD ["deno", "run", "--allow-env", "--allow-net", "--allow-read", "--allow-sys", "dist/main.js"]
