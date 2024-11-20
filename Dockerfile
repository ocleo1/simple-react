FROM node:20-alpine AS base

FROM base AS installer
RUN addgroup -S -g 1001 nodejs
RUN adduser -S -u 1001 -G nodejs nodejs
WORKDIR /srv
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev
COPY . .

FROM installer AS dev
RUN chown -R nodejs:nodejs /srv/* 
USER nodejs
CMD npm run start

FROM installer AS builder
RUN npm run build
