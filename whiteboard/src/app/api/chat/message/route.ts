// File: app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET: Fetch messages for a chat room
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chatRoomId = searchParams.get('chatRoomId');

  if (!chatRoomId) {
    return NextResponse.json({ error: 'Chat room ID is required' }, { status: 400 });
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { chatRoomId },
      include: {
        author: {
          select: { id: true, name: true, color: true }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 100 // Limit to last 100 messages
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST: Send a new message
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content, chatRoomId, type = 'message' } = await request.json();

  if (!content || !chatRoomId) {
    return NextResponse.json({ error: 'Content and chat room ID are required' }, { status: 400 });
  }

  try {
    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        content,
        type,
        authorId: user.id,
        chatRoomId
      },
      include: {
        author: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    // Update user's last seen in chat room
    await prisma.chatRoomUser.upsert({
      where: {
        userId_chatRoomId: {
          userId: user.id,
          chatRoomId
        }
      },
      update: { lastSeen: new Date() },
      create: {
        userId: user.id,
        chatRoomId,
        lastSeen: new Date()
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// File: app/api/chat/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch online users in a chat room
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chatRoomId = searchParams.get('chatRoomId');

  if (!chatRoomId) {
    return NextResponse.json({ error: 'Chat room ID is required' }, { status: 400 });
  }

  try {
    // Consider users online if they've been active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const users = await prisma.chatRoomUser.findMany({
      where: { 
        chatRoomId,
        lastSeen: { gte: fiveMinutesAgo }
      },
      include: {
        user: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    const formattedUsers = users.map(chatUser => ({
      id: chatUser.user.id,
      username: chatUser.user.name || 'Anonymous',
      color: chatUser.user.color || '#3B82F6',
      isOnline: true
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// File: app/api/chat/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// POST: Create a new chat room
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, drawingId } = await request.json();

  try {
    const chatRoom = await prisma.chatRoom.create({
      data: {
        name,
        drawingId
      }
    });

    return NextResponse.json(chatRoom);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create chat room' }, { status: 500 });
  }
}

// GET: Get chat room for a drawing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingId = searchParams.get('drawingId');

  if (!drawingId) {
    return NextResponse.json({ error: 'Drawing ID is required' }, { status: 400 });
  }

  try {
    let chatRoom = await prisma.chatRoom.findUnique({
      where: { drawingId: parseInt(drawingId) }
    });

    // If no chat room exists for this drawing, create one
    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          name: `Drawing ${drawingId} Chat`,
          drawingId: parseInt(drawingId)
        }
      });
    }

    return NextResponse.json(chatRoom);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get chat room' }, { status: 500 });
  }
}