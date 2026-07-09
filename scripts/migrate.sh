#!/bin/bash
service postgresql start
sleep 2
su - postgres -c "psql -d fintrack -f /mnt/c/Users/USER/vscode/fintrack-backend/prisma/migrations/0_init/migration.sql"
su - postgres -c "psql -d fintrack -f /mnt/c/Users/USER/vscode/documind-backend/prisma/001_documind.sql"
echo "migrations done"
