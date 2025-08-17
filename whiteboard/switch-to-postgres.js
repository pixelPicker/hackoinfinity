const fs = require('fs');
const path = require('path');

console.log('🔄 Switching from SQLite to PostgreSQL...');

// Update Prisma schema
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Replace SQLite configuration with PostgreSQL
schemaContent = schemaContent.replace(
  /datasource db \{\s+provider = "sqlite"\s+url\s+=\s+"file:\.\/dev\.db"\s+\}/,
  `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
);

fs.writeFileSync(schemaPath, schemaContent);
console.log('✅ Updated Prisma schema to use PostgreSQL');

// Update .env file
const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace SQLite URL with PostgreSQL URL
envContent = envContent.replace(
  /DATABASE_URL=.*/,
  'DATABASE_URL="postgresql://postgres:your_password@localhost:5432/doodlesquad"'
);

fs.writeFileSync(envPath, envContent);
console.log('✅ Updated .env file with PostgreSQL connection string');

console.log('\n📋 Next steps:');
console.log('1. Install PostgreSQL (see setup-postgres.md)');
console.log('2. Create the database: CREATE DATABASE doodlesquad;');
console.log('3. Update the password in .env file');
console.log('4. Run: node migrate-to-postgres.js');
console.log('5. Run: npx prisma generate');
console.log('6. Run: npx prisma db push');
console.log('7. Start the app: npm run dev');

console.log('\n⚠️  Remember to:');
console.log('- Replace "your_password" with your actual PostgreSQL password');
console.log('- Make sure PostgreSQL is running on port 5432');
console.log('- Ensure the database "doodlesquad" exists');
