import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courses = await prismaDB.course.findMany({
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

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, skillId } = await req.json()
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const course = await prismaDB.course.create({
      data: {
        title,
        description,
        createdById: session.user.id,
        ...(skillId && { skillId }),
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
