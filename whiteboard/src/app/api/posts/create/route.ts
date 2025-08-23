import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { img, title, authorId } = body;

  try {
    const post = await prisma.post.create({
      data: {
        img,
        title,
        author: { connect: { id: authorId } },
      },
    });

    return NextResponse.json(post);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
