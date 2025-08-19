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

    // Check if room code already exists
    const existingRoom = await prisma.room.findUnique({
      where: { roomCode }
    })

    if (existingRoom) {
      return NextResponse.json({ error: 'Room code already exists' }, { status: 409 })
    }

    // Create new room
    const room = await prisma.room.create({
      data: {
        roomCode,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ success: true, room })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
