FROM node:24-alpine as build-stage
WORKDIR /app
RUN npm i -g pnpm
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install
COPY . .
ARG NUXT_APP_BASE_URL=/
ENV NUXT_APP_BASE_URL=$NUXT_APP_BASE_URL
RUN pnpm build

FROM node:24-alpine
RUN apk add --no-cache curl
WORKDIR /app

COPY --from=build-stage /app/.output /app
COPY entrypoint.mjs /app

EXPOSE 3000
ENV NODE_ENV=production
LABEL org.opencontainers.image.source=https://github.com/not-three/ui
LABEL org.opencontainers.image.title="not-th.re/ui"
LABEL org.opencontainers.image.description="!3 is a simple, secure and open source paste sharing platform."
LABEL org.opencontainers.image.authors="Joschua Becker EDV <support@scolasti.co>"
STOPSIGNAL SIGINT

CMD ["node", "entrypoint.mjs"]
