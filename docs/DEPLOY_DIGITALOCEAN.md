# Deploy Lumitria on DigitalOcean (Ubuntu + Nginx + PostgreSQL)

This guide matches a single droplet serving **https://lumitrialearning.org** with:

- **Nginx**: static `dist/` + reverse proxy `/api` → Node on port 4000  
- **PostgreSQL**: local database (same `DATABASE_URL` shape as your `server/.env`)  
- **systemd**: `lumitria-api` runs the compiled API  

Repository: [lumitrialearning](https://github.com/AdejojuAdetiloye/lumitrialearning.git)

## 1. DNS

Point **A records** for `lumitrialearning.org` and `www.lumitrialearning.org` to your **droplet’s public IP** before running Certbot.

If DNS still points elsewhere, Let’s Encrypt will fail (the challenge hits whatever IP the domain resolves to). After updating DNS, wait for propagation, then run Certbot again.

Until HTTPS is enabled, the app is available over **HTTP** on the droplet IP (the sample Nginx config uses `default_server` on port 80 so `/` and `/api` work when you open `http://YOUR_DROPLET_IP`).

## 2. First-time server setup (SSH as root)

```bash
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y postgresql postgresql-contrib nginx git ufw curl ca-certificates

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

## 3. PostgreSQL (match your `DATABASE_URL`)

If your URL is `postgresql://postgres:YOUR_PASSWORD@localhost:5432/lumetria?schema=public`:

```bash
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'YOUR_PASSWORD';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'lumetria'" | grep -q 1 || sudo -u postgres createdb lumetria
```

## 4. App directory and clone

```bash
mkdir -p /var/www/lumitrialearning
cd /var/www/lumitrialearning
git clone https://github.com/AdejojuAdetiloye/lumitrialearning.git .
```

## 5. Environment file

Copy your local `server/.env` to the server:

`server/.env` on the droplet should keep **the same** `DATABASE_URL`, `JWT_SECRET`, and Flutterwave keys you use locally.

**Required for production browser access:** set `CORS_ORIGINS` to include your live site, for example:

```env
CORS_ORIGINS="https://lumitrialearning.org,https://www.lumitrialearning.org"
```

**Admin bootstrap (used by `npm run db:seed` in `server/`):**

```env
ADMIN_EMAIL="info@lumitrialearning.org"
ADMIN_PASSWORD="your-secure-password"
ADMIN_FIRST_NAME="Fidelis"
ADMIN_LAST_NAME="Opuole"
```

The frontend calls the API with **relative** `/api` URLs when `VITE_API_URL` is unset, which matches this Nginx layout.

## 6. Build frontend + API, migrate DB, seed

```bash
cd /var/www/lumitrialearning
npm ci
npm run build

cd server
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy
npm run db:seed
```

## 7. Nginx + systemd

```bash
cp /var/www/lumitrialearning/deploy/nginx-lumitrialearning.org.conf /etc/nginx/sites-available/lumitrialearning.org
ln -sf /etc/nginx/sites-available/lumitrialearning.org /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

cp /var/www/lumitrialearning/deploy/lumitria-api.service /etc/systemd/system/lumitria-api.service
systemctl daemon-reload
systemctl enable --now lumitria-api
```

## 8. TLS (Let’s Encrypt)

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d lumitrialearning.org -d www.lumitrialearning.org --non-interactive --agree-tos -m YOUR_EMAIL
```

## 9. Flutterwave webhook

In the Flutterwave dashboard, set the webhook URL to:

`https://lumitrialearning.org/api/checkout/flutterwave-webhook`

Use the same `FLUTTERWAVE_SECRET_HASH` as in `server/.env`.

## 10. Updates after `git push`

SSH into the droplet, then from the app directory run the update script (or the commands below).

**Script (recommended):**

```bash
cd /var/www/lumitrialearning
chmod +x deploy/update-production.sh   # first time only
./deploy/update-production.sh
```

Frontend-only changes (skip re-seeding the DB):

```bash
SKIP_SEED=1 ./deploy/update-production.sh
```

**Manual one-liner (same as before):**

```bash
cd /var/www/lumitrialearning
git pull
npm ci
npm run build
cd server && npm ci && npx prisma generate && npm run build && npx prisma migrate deploy && npm run db:seed
systemctl restart lumitria-api
```
