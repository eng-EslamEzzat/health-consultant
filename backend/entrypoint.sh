#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
while ! python -c "
import socket, sys, os
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect((os.environ.get('DB_HOST', 'db'), int(os.environ.get('DB_PORT', 5432))))
    s.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
    sleep 1
done
echo "PostgreSQL is ready!"

if [ "$SKIP_MIGRATIONS" != "true" ]; then
    echo "Applying migrations..."
    python manage.py migrate --noinput
    echo "Migrations applied successfully."
else
    echo "Skipping migrations (SKIP_MIGRATIONS is set)."
fi

echo "Collecting static files..."
python manage.py collectstatic --noinput
echo "Static files collected successfully."

echo "Starting command: $@"
exec "$@"
