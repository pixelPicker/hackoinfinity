import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: [{ trending: "desc" }, { upvotes: "desc" }],
    });

    const formattedPosts = posts.map((post: any) => ({
      id: post.id,
      user: post.author.name || "Anonymous",
      avatar:
        post.author.image ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      time: formatTimeAgo(post.createdAt),
      createdAt: post.createdAt.toISOString(),
      views: post.views,
      title: post.title,
      description: post.description || "",
      img: post.img,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      comments: post.comments,
      shares: post.shares,
      trending: post.trending,
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}hr ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo ago`;
  }
}
