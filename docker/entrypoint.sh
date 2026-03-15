#!/bin/bash
set -e

# Install npm dependencies if not present
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

exec "$@"
