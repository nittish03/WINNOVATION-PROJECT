import { NextResponse } from "next/server"
import { prismaDB } from "@/lib/prismaDB"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOption"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { threadId } = params

    const thread = await prismaDB.discussionThread.findUnique({
      where: { id: threadId },
      include: {
        author: {
          select: { name: true, email: true }
        },
        course: {
          select: { title: true }
        },
        _count: {
          select: { replies: true }
        }
      }
    })

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    return NextResponse.json(thread)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
