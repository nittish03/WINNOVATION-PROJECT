import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET() {
  try {
    const courses = await prismaDB.course.findMany({
      include: {
        skill: true,
        createdBy: {
          select: { name: true, email: true }
        },
        _count: {
          select: { enrollments: true }
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
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, skillId } = await request.json()
    
    const course = await prismaDB.course.create({
      data: {
        title,
        description: description || null,
        skillId: skillId || null,
        createdById: session.user.id,
        publishedAt: new Date()
      },
      include: {
        skill: true,
        createdBy: {
          select: { name: true, email: true }
        }
      }
    })
    
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
