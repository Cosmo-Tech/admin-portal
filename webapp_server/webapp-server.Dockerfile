# SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
# SPDX-License-Identifier: LicenseRef-CosmoTech

# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:18-alpine AS install_build_dependencies

RUN corepack enable

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install --immutable


# ── Stage 2: Build ─────────────────────────────────────────────────────────────
FROM install_build_dependencies AS builder

COPY . .

ARG VITE_BUILD_NUMBER
ENV VITE_BUILD_NUMBER=${VITE_BUILD_NUMBER}

RUN yarn build


# ── Stage 3a: Serve — "specific" mode (default) ───────────────────────────────
# Baked-in config from src/config/apis.json. Ready to use without ConfigMap.
FROM nginx:stable-alpine AS server-specific

LABEL com.cosmotech.admin-portal.buildType="specific"

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html
COPY webapp_server/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


# ── Stage 3b: Serve — "universal" mode ────────────────────────────────────────
# Config injected at runtime via ConfigMap mounted at /webapp/patch_config/.
FROM nginx:stable-alpine AS server-universal

LABEL com.cosmotech.admin-portal.buildType="universal"

# Install bash for the startup script
RUN apk add --no-cache bash

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html
COPY webapp_server/nginx-universal.conf /etc/nginx/conf.d/default.conf
COPY scripts/patch_webapp_server/patch_and_start_server.sh /webapp/patch_and_start_server.sh

RUN chmod +x /webapp/patch_and_start_server.sh

# Create the patch_config mount point and tmp working directory
RUN mkdir -p /webapp/patch_config /tmp/webapp

EXPOSE 80

CMD ["/webapp/patch_and_start_server.sh"]
