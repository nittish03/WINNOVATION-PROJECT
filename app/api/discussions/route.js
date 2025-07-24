import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const where = courseId ? { courseId } : {}

    const discussions = await prismaDB.discussionThread.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(discussions)
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

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const discussion = await prismaDB.discussionThread.create({
      data: {
        title,
        content,
        courseId: courseId || null,
        authorId: session.user.id
      },
      include: {
        author: {
          select: { name: true, email: true }
        },
        course: {
          select: { title: true }
        }
      }
    })

    return NextResponse.json(discussion)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
