import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'

export async function GET(request, { params }) {
  try {
    const discussions = await prismaDB.discussionThread.findMany({
      where: { courseId: params.id },
      include: {
        author: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(discussions)
  } catch (error) {
    console.error('Error fetching discussions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
