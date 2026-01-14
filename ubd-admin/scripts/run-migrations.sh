#!/bin/bash

# Script to run Prisma migrations in production
# This should be run after deployment to create database tables

set -e

echo "🚀 Running Prisma migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL before running migrations"
    exit 1
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed successfully!"
echo ""
echo "To verify tables were created, you can run:"
echo "  npx prisma studio"
echo ""
echo "Or connect to your database and run:"
echo "  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
