const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if we have any posts
    const postCount = await prisma.post.count();
    console.log(`📊 Current posts in database: ${postCount}`);
    
    if (postCount === 0) {
      console.log('🌱 Seeding database with sample data...');
      
      // Create sample user first
      const user = await prisma.user.upsert({
        where: { email: 'dhiraj@example.com' },
        update: {},
        create: {
          email: 'dhiraj@example.com',
          name: 'Dhiraj Woli',
          image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        },
      });
      
      // Create sample posts
      const samplePosts = [
        {
          title: "Cyberpunk Night Scene",
          description: "Digital art inspired by neon-lit cityscapes",
          img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
          views: 100000,
          upvotes: 2847,
          downvotes: 23,
          comments: 156,
          shares: 89,
          trending: true,
          authorId: user.id,
        },
        {
          title: "Ocean Waves Study",
          description: "Watercolor technique exploration",
          img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
          views: 45000,
          upvotes: 1923,
          downvotes: 12,
          comments: 87,
          shares: 34,
          trending: true,
          authorId: user.id,
        },
        {
          title: "Abstract Geometry",
          description: "Exploring form and color relationships",
          img: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
          views: 92000,
          upvotes: 2234,
          downvotes: 31,
          comments: 145,
          shares: 76,
          trending: false,
          authorId: user.id,
        }
      ];
      
      for (const postData of samplePosts) {
        await prisma.post.create({ data: postData });
      }
      
      console.log('✅ Sample data created successfully');
    }
    
    // Test fetching posts
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      take: 3,
    });
    
    console.log('📋 Sample posts from database:');
    posts.forEach(post => {
      console.log(`  - ${post.title} by ${post.author.name} (${post.upvotes} upvotes)`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
