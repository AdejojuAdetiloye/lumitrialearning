#!/usr/bin/env bash
# Run ON THE PRODUCTION SERVER (SSH), after pushing to GitHub.
# Default path matches docs/DEPLOY_DIGITALOCEAN.md — override if your clone lives elsewhere:
#   APP_DIR=/var/www/myapp ./deploy/update-production.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/lumitrialearning}"
cd "$APP_DIR"

# Small droplets (e.g. 512MB RAM): Vite can OOM without a higher heap; swap + this avoids failed builds.
if [[ -z "${NODE_OPTIONS:-}" ]]; then
  export NODE_OPTIONS="--max-old-space-size=1536"
fi

echo "==> Pull latest from Git"
git pull

echo "==> Frontend (Vite) build"
npm ci
npm run build

echo "==> API: deps, Prisma, build, migrations"
cd server
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy

if [[ "${SKIP_SEED:-}" != "1" ]]; then
  echo "==> DB seed (set SKIP_SEED=1 to skip on frontend-only deploys)"
  npm run db:seed
else
  echo "==> Skipping db:seed (SKIP_SEED=1)"
fi

echo "==> Restart API"
sudo systemctl restart lumitria-api

echo "==> Done. Static files are in dist/; Nginx serves them without reload."
echo "    If you changed deploy/nginx-*.conf, run: sudo nginx -t && sudo systemctl reload nginx"
