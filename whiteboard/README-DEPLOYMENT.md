# Leaderboard Deployment Guide

## Database Setup for Production

### 1. Environment Variables
Create a `.env` file with:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 2. Database Migration
After deployment, run:
```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. Initial Data (Optional)
To add sample posts, visit: `https://yourdomain.com/api/test-posts`

## Features Included
- ✅ Database-connected leaderboard (replaces mock data)
- ✅ Orange cartoonish theme matching homepage
- ✅ Real-time voting with database persistence
- ✅ Search, filter, and sort functionality
- ✅ Empty state with proper messaging
- ✅ Responsive design with hover effects

## Database Schema
- **Users**: Store artist information
- **Posts**: Store artwork with votes, views, comments
- **Votes**: Track user voting history

## API Endpoints
- `GET /api/test-posts` - Creates sample posts for testing
