import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    const courses = await prismaDB.course.findMany({
      where: { publishedAt: { not: null } },
      include: {
        createdBy: { select: { name: true } },
        skill: { select: { name: true, category: true } },
        _count: {
          select: {
            enrollments: true,
            assignments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(courses)
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

    const { title, description, skillId } = await request.json()
    
    const course = await prismaDB.course.create({
      data: {
        title,
        description,
        skillId: skillId || null,
        createdById: session.user.id,
        publishedAt: new Date()
      }
    })
    
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
