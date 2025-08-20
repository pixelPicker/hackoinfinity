import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    // Check if posts exist
    const existingPosts = await prisma.post.findMany({
      include: {
        author: true,
      },
    });

    if (existingPosts.length > 0) {
      return NextResponse.json({ 
        message: 'Posts already exist', 
        count: existingPosts.length,
        posts: existingPosts.map((p: any) => ({ title: p.title, author: p.author.name }))
      });
    }

    // Create user first
    const user = await prisma.user.create({
      data: {
        email: `artist${Date.now()}@example.com`,
        name: 'Creative Artist',
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      },
    });

    // Create sample posts
    const samplePosts = [
      {
        title: "Sunset Mountain Landscape",
        description: "A breathtaking oil painting of mountains during golden hour",
        img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        views: 15420,
        upvotes: 342,
        downvotes: 8,
        comments: 67,
        shares: 23,
        trending: true,
        authorId: user.id,
      },
      {
        title: "Abstract Color Explosion",
        description: "Digital art exploring vibrant colors and dynamic forms",
        img: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
        views: 8930,
        upvotes: 198,
        downvotes: 12,
        comments: 45,
        shares: 18,
        trending: false,
        authorId: user.id,
      },
      {
        title: "Fantasy Forest Realm",
        description: "Mystical woodland scene with magical creatures",
        img: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
        views: 19340,
        upvotes: 445,
        downvotes: 15,
        comments: 89,
        shares: 56,
        trending: true,
        authorId: user.id,
      }
    ];

    const createdPosts = [];
    for (const postData of samplePosts) {
      const post = await prisma.post.create({ data: postData });
      createdPosts.push(post);
    }

    return NextResponse.json({ 
      message: 'Sample posts created successfully!', 
      count: createdPosts.length,
      posts: createdPosts.map(p => ({ id: p.id, title: p.title }))
    });

  } catch (error) {
    console.error('Error creating posts:', error);
    return NextResponse.json({ 
      error: 'Failed to create posts', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
