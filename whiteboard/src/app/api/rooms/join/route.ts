import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomCode } = await request.json()

    if (!roomCode) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 })
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if room exists and is active
    const room = await prisma.room.findFirst({
      where: {
        roomCode,
        isActive: true
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found or inactive' }, { status: 404 })
    }

    // Add user to room participants (upsert to handle duplicate joins)
    await prisma.roomParticipant.upsert({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: user.id
        }
      },
      update: {
        joinedAt: new Date()
      },
      create: {
        roomId: room.id,
        userId: user.id,
      }
    })

    return NextResponse.json({ success: true, room })
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}


