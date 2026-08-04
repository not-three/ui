FROM node:26-alpine as build-stage
WORKDIR /app
RUN npm i -g pnpm
# The full source must be present before `pnpm install` runs: package.json's
# postinstall script (nuxt prepare + scripts/copy-sandbox-vendor.mjs +
# scripts/fetch-pyodide-wheels.mjs) vendors the sandbox interpreter assets,
# and those scripts don't exist yet if only the manifest files are copied in.
COPY . .
RUN pnpm install
ARG NUXT_APP_BASE_URL=/
ENV NUXT_APP_BASE_URL=$NUXT_APP_BASE_URL
RUN pnpm generate

FROM node:26-alpine
RUN apk add --no-cache curl
WORKDIR /app

# Copy the static export to /app/public
COPY --from=build-stage /app/.output/public /app/public
# Copy the entrypoint code
COPY entrypoint /app/entrypoint

WORKDIR /app/entrypoint
RUN npm i -g pnpm && pnpm install

EXPOSE 3000
ENV NODE_ENV=production
LABEL org.opencontainers.image.source=https://github.com/not-three/ui
LABEL org.opencontainers.image.title="not-th.re/ui"
LABEL org.opencontainers.image.description="!3 is a simple, secure and open source paste sharing platform."
LABEL org.opencontainers.image.authors="Joschua Becker EDV <support@scolasti.co>"
STOPSIGNAL SIGINT

CMD ["node", "index.mjs"]
