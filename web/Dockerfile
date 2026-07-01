# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
# 若构建时出现 “DNS: transient error” 且 libc6-compat “no such package”，多为 APK 索引未拉取成功。
# 可显式指定镜像，例如：docker compose build --build-arg ALPINE_MIRROR=https://mirrors.aliyun.com/alpine
ARG ALPINE_MIRROR=
RUN if [ -n "$ALPINE_MIRROR" ]; then \
      sed -i "s|https://dl-cdn.alpinelinux.org/alpine|${ALPINE_MIRROR}|g" /etc/apk/repositories; \
    fi
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
# postinstall 会执行 sync 脚本；须先于 npm ci 放入脚本（容器内无 monorepo 的 supersplat/ 时脚本会安全跳过）
COPY scripts/sync-supersplat-editor.mjs scripts/sync-supersplat-editor.mjs
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache sqlite
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p /data \
  && chown -R nextjs:nodejs /data
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
