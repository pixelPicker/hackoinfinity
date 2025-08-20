import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // your Prisma client

export async function GET(
  request: Request,
  { params }: { params: { roomCode: string } }
) {
  try {
    const roomWithUsers = await prisma.room.findUnique({
      where: { roomCode: params.roomCode.toUpperCase() },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!roomWithUsers) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(roomWithUsers);
  } catch (err) {
    console.error("Error fetching room:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
