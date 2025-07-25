import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params;
    const { replyId } = resolvedParams;
    const reply = await prismaDB.discussionReply.findUnique({
      where: { id: replyId }
    })

    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
    }

    if (session.user.role !== 'admin' && session.user.id !== reply.authorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prismaDB.discussionReply.delete({
      where: { id: replyId }
    })
    
    return NextResponse.json({ message: 'Reply deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
