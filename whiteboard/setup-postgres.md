# PostgreSQL Setup Guide

## Step 1: Install PostgreSQL

### Option 1: Using Chocolatey (Recommended)
```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install PostgreSQL
choco install postgresql
```

### Option 2: Download from Official Website
1. Go to: https://www.postgresql.org/download/windows/
2. Download the installer
3. Run the installer and follow the setup wizard
4. Remember the password you set for the `postgres` user

### Option 3: Using Docker
```bash
docker run --name postgres-doodlesquad -e POSTGRES_PASSWORD=password -e POSTGRES_DB=doodlesquad -p 5432:5432 -d postgres
```

## Step 2: Create Database and User

Once PostgreSQL is installed, open a terminal and run:

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database
CREATE DATABASE doodlesquad;

# Create user (optional - you can use postgres user)
CREATE USER doodlesquad_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE doodlesquad TO doodlesquad_user;

# Exit psql
\q
```

## Step 3: Update Environment Variables

Update your `.env` file with the correct PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/doodlesquad"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="nigesh123456"
```

## Step 4: Update Prisma Schema

Change the datasource in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Step 5: Migrate Data

Run the migration script to transfer data from SQLite to PostgreSQL:

```bash
node migrate-to-postgres.js
```

## Step 6: Update Database

```bash
npx prisma generate
npx prisma db push
```

## Step 7: Test the Application

```bash
npm run dev
```

Visit http://localhost:3000 and test login/registration.

## Troubleshooting

### If you get connection errors:
1. Make sure PostgreSQL service is running
2. Check if the port 5432 is not blocked
3. Verify the password in the connection string
4. Ensure the database exists

### If migration fails:
1. Make sure PostgreSQL is properly installed
2. Check the connection string in .env
3. Ensure you have the correct permissions

### To check if PostgreSQL is running:
```bash
# Windows
sc query postgresql

# Or check if port 5432 is listening
netstat -an | findstr 5432
```
