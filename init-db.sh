#!/bin/bash
# Initialize database file with correct permissions

# Create database file if it doesn't exist
touch /app/database.sqlite

# Set proper ownership and permissions
chown appuser:appgroup /app/database.sqlite
chmod 644 /app/database.sqlite

# Execute the original command
exec "$@"
