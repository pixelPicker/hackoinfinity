import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const { postId, type, increment } = await request.json();

    const updateData = increment
      ? { [type === 'up' ? 'upvotes' : 'downvotes']: { increment: 1 } }
      : { [type === 'up' ? 'upvotes' : 'downvotes']: { decrement: 1 } };

    await prisma.post.update({
      where: { id: postId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating vote:', error);
    return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
  }
}
