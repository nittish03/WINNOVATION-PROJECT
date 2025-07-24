import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    const threads = await prismaDB.discussionThread.findMany({
      include: {
        author: { select: { name: true } },
        course: { select: { title: true } },
        _count: { select: { replies: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(threads)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, courseId } = await request.json()
    
    const thread = await prismaDB.discussionThread.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        courseId: courseId || null
      }
    })
    return NextResponse.json(thread)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
