import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const thread = await prismaDB.discussionThread.findUnique({
      where: { id: id },
      include: {
        author: { select: { name: true, image: true } },
      }
    })
    if (!thread) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
    }
    return NextResponse.json(thread)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params;
    const thread = await prismaDB.discussionThread.findUnique({
      where: { id: id }
    })

    if (!thread) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
    }

    if (session.user.role !== 'admin' && session.user.id !== thread.authorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prismaDB.discussionThread.delete({
      where: { id: id }
    })
    
    return NextResponse.json({ message: 'Discussion deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
