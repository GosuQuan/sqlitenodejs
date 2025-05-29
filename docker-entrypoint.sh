#!/bin/bash
set -e

# Create database directory if it doesn't exist
mkdir -p /app/logs

# Create empty database file if it doesn't exist
if [ ! -f /app/database.sqlite ]; then
  echo "Creating new database file..."
  touch /app/database.sqlite
fi

# Ensure proper permissions
chown -R appuser:appgroup /app/database.sqlite /app/logs
chmod 644 /app/database.sqlite

# Switch to appuser for running the application
exec gosu appuser "$@"
