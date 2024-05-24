FROM node:18-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY src/frontend/package.json src/frontend/pnpm-lock.yaml ./

RUN corepack enable pnpm && pnpm i

COPY src/frontend/ .

EXPOSE 3000

CMD pnpm dev

