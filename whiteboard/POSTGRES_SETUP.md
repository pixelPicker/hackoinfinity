# PostgreSQL + Prisma Setup Guide

## ✅ Current Status
- ✅ Prisma schema updated to use PostgreSQL
- ✅ Environment variables configured
- ✅ Prisma client generated for PostgreSQL
- ⏳ **Next: Install PostgreSQL and create database**

## 🗄️ Step 1: Install PostgreSQL

### Option A: Download from Official Website (Recommended)
1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Choose the latest version for Windows x86-64
4. Run the installer **as Administrator**
5. Follow the setup wizard
6. **Remember the password** you set for the `postgres` user
7. Keep the default port (5432)

### Option B: Using Docker (if you have Docker)
```bash
docker run --name postgres-doodlesquad -e POSTGRES_PASSWORD=password -e POSTGRES_DB=doodlesquad -p 5432:5432 -d postgres
```

## 🗃️ Step 2: Create Database

After installing PostgreSQL, open a new terminal and run:

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Enter the password you set during installation
# Then run these commands:

CREATE DATABASE doodlesquad;
\q
```

## 🔧 Step 3: Update Environment Variables

Edit your `.env` file and replace `your_password` with your actual PostgreSQL password:

```env
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/doodlesquad"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=nigesh123456
```

## 📦 Step 4: Migrate Data from SQLite

Run the migration script to transfer your existing data:

```bash
node migrate-to-postgres.js
```

## 🚀 Step 5: Push Schema to PostgreSQL

```bash
npx prisma db push
```

## 🧪 Step 6: Test the Application

```bash
npm run dev
```

Visit http://localhost:3000 and test:
- Registration
- Login
- Navigation to whiteboard page

## 🔍 Troubleshooting

### If you get "connection refused" error:
1. Make sure PostgreSQL service is running
2. Check if port 5432 is available
3. Verify the password in your .env file

### If you get "database does not exist" error:
1. Connect to PostgreSQL: `psql -U postgres`
2. Create database: `CREATE DATABASE doodlesquad;`
3. Exit: `\q`

### To check if PostgreSQL is running:
```bash
# Windows
sc query postgresql

# Or check if port 5432 is listening
netstat -an | findstr 5432
```

### To start PostgreSQL service:
```bash
# Windows
net start postgresql
```

## 📊 Verification Commands

After setup, you can verify everything is working:

```bash
# Check PostgreSQL connection
psql -U postgres -d doodlesquad -c "SELECT version();"

# Check Prisma connection
npx prisma studio

# View your data
npx prisma studio
```

## 🎯 Expected Results

After successful setup:
- ✅ PostgreSQL running on port 5432
- ✅ Database "doodlesquad" created
- ✅ All existing users migrated from SQLite
- ✅ Login/registration working
- ✅ Users redirected to whiteboard after sign-in
- ✅ Session management working

## 📝 Notes

- **Data Preservation**: All existing users and sessions will be migrated
- **Performance**: PostgreSQL is more scalable than SQLite
- **Production Ready**: This setup is suitable for production deployment
- **Backup**: Your SQLite database (`dev.db`) is preserved as backup
