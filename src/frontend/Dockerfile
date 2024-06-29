FROM node:18-alpine

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_LOCAL_MODE_ENABLED
ARG NEXT_PUBLIC_PRO_MODE_ENABLED

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_LOCAL_MODE_ENABLED=${NEXT_PUBLIC_LOCAL_MODE_ENABLED}
ENV NEXT_PUBLIC_PRO_MODE_ENABLED=${NEXT_PUBLIC_PRO_MODE_ENABLED}


RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY src/frontend/package.json src/frontend/pnpm-lock.yaml ./

RUN corepack enable pnpm && pnpm i

COPY src/frontend/ .

EXPOSE 3000

RUN pnpm run build

CMD pnpm run start

