#!/usr/bin/env bash
set -eu
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'goodness2018';"
if ! sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'lumetria'" | grep -q 1; then
  sudo -u postgres createdb lumetria
fi
echo "PostgreSQL ready: database lumetria, user postgres"
