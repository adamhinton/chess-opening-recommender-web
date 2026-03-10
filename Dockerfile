# syntax=docker/dockerfile:1

FROM node:24.14.0 AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Declare build arguments
ARG HF_SPACE_URL_PROD
ARG NEXT_PUBLIC_HF_SPACE_URL_DEV
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
ARG HF_API_TOKEN

# Set them as environment variables for the build
ENV HF_SPACE_URL_PROD=$HF_SPACE_URL_PROD
ENV NEXT_PUBLIC_HF_SPACE_URL_DEV=$NEXT_PUBLIC_HF_SPACE_URL_DEV
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
ENV HF_API_TOKEN=$HF_API_TOKEN

RUN npm run build

FROM node:24.14.0 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]