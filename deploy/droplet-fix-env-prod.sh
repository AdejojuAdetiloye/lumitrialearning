#!/usr/bin/env bash
set -e

ENV="/var/www/lumitrialearning/server/.env"

# Normalize line endings
sed -i 's/\r$//' "$ENV"

# Force production CORS
if grep -q '^CORS_ORIGINS=' "$ENV"; then
  sed -i 's|^CORS_ORIGINS=.*|CORS_ORIGINS="https://lumitrialearning.org,https://www.lumitrialearning.org"|' "$ENV"
else
  echo 'CORS_ORIGINS="https://lumitrialearning.org,https://www.lumitrialearning.org"' >> "$ENV"
fi

# Ensure admin seed vars exist (seed reads these; safe to keep even after first seed)
grep -q '^ADMIN_EMAIL=' "$ENV" || cat >> "$ENV" <<'EOF'

ADMIN_EMAIL=lumitrialearning@gmail.com
ADMIN_PASSWORD=Oyifidel@1106
ADMIN_FIRST_NAME=Fidelis
ADMIN_LAST_NAME=Opuole
EOF

systemctl restart lumitria-api
systemctl is-active lumitria-api >/dev/null
echo "ok"

