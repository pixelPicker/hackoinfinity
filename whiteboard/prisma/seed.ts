import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample users first
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'dhiraj@example.com' },
      update: {},
      create: {
        email: 'dhiraj@example.com',
        name: 'Dhiraj Woli',
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      },
    }),
    prisma.user.upsert({
      where: { email: 'alex@example.com' },
      update: {},
      create: {
        email: 'alex@example.com',
        name: 'Alex Rivera',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=100',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maya@example.com' },
      update: {},
      create: {
        email: 'maya@example.com',
        name: 'Maya Chen',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jordan@example.com' },
      update: {},
      create: {
        email: 'jordan@example.com',
        name: 'Jordan Kim',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sam@example.com' },
      update: {},
      create: {
        email: 'sam@example.com',
        name: 'Sam Torres',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      },
    }),
  ]);

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
      authorId: users[0].id,
      createdAt: new Date('2024-08-17T11:00:00Z'),
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
      authorId: users[1].id,
      createdAt: new Date('2024-08-17T10:00:00Z'),
    },
    {
      title: "Portrait in Charcoal",
      description: "Realistic portrait study with dramatic lighting",
      img: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800",
      views: 78000,
      upvotes: 3156,
      downvotes: 18,
      comments: 203,
      shares: 127,
      trending: false,
      authorId: users[2].id,
      createdAt: new Date('2024-08-17T09:00:00Z'),
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
      authorId: users[3].id,
      createdAt: new Date('2024-08-16T12:00:00Z'),
    },
    {
      title: "Fantasy Landscape",
      description: "Mystical forest with magical creatures",
      img: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
      views: 62000,
      upvotes: 2789,
      downvotes: 15,
      comments: 192,
      shares: 98,
      trending: true,
      authorId: users[4].id,
      createdAt: new Date('2024-08-17T07:00:00Z'),
    },
    {
      title: "Street Art Mural",
      description: "Urban expression on brick wall",
      img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      views: 34000,
      upvotes: 1567,
      downvotes: 42,
      comments: 89,
      shares: 45,
      trending: false,
      authorId: users[0].id,
      createdAt: new Date('2024-08-17T06:00:00Z'),
    },
    {
      title: "Sunset Mountains",
      description: "Oil painting of mountain landscape at golden hour",
      img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      views: 55000,
      upvotes: 1890,
      downvotes: 28,
      comments: 134,
      shares: 67,
      trending: false,
      authorId: users[1].id,
      createdAt: new Date('2024-08-17T04:00:00Z'),
    },
    {
      title: "Urban Sketch",
      description: "Pen and ink drawing of city street scene",
      img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      views: 68000,
      upvotes: 2340,
      downvotes: 19,
      comments: 178,
      shares: 92,
      trending: true,
      authorId: users[2].id,
      createdAt: new Date('2024-08-17T02:00:00Z'),
    },
  ];

  // Create posts
  for (const postData of samplePosts) {
    await prisma.post.create({
      data: postData,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
