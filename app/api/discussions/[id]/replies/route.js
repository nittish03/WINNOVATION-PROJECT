import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const replies = await prismaDB.discussionReply.findMany({
      where: { threadId: id },
      include: {
        author: { select: { name: true, image: true } }
      },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(replies)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { content } = await request.json()

    if (!content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }
    
    const reply = await prismaDB.discussionReply.create({
      data: {
        content,
        threadId: id,
        authorId: session.user.id,
      }
    })
    return NextResponse.json(reply)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const thread = await prismaDB.discussionThread.findUnique({
      where: { id: id }
    })

    if (!thread) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
    }

    if (session.user.role !== 'admin' && session.user.id !== thread.authorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prismaDB.discussionReply.deleteMany({
      where: { threadId: id }
    })
    
    return NextResponse.json({ message: 'All replies deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
