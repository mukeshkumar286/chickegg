#!/bin/bash

# Set environment variables for RDS database connection
echo "Setting environment variables for database..."

# Create environment file
cat > /var/app/staging/.env.production << EOL
# Database Configuration
DATABASE_URL=postgres://postgres:mkPassword12\$@database-1.cj8yu6ygm10q.us-east-2.rds.amazonaws.com:5432/postgres
PGHOST=database-1.cj8yu6ygm10q.us-east-2.rds.amazonaws.com
PGUSER=postgres
PGPASSWORD=mkPassword12\$
PGDATABASE=postgres
PGPORT=5432
NODE_ENV=production
EOL

# Make the file accessible to the node process
chmod 644 /var/app/staging/.env.production
cp /var/app/staging/.env.production /var/app/current/.env.production 2>/dev/null || :

echo "Environment variables set successfully."
