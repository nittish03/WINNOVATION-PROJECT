import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const filter = session.user.role === 'admin' ? {} : { userId: session.user.id }
    
    const enrollments = await prismaDB.enrollment.findMany({
      where: filter,
      include: {
        user: {
          select: { name: true, email: true }
        },
        course: {
          include: {
            skill: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })
    
    return NextResponse.json(enrollments)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await request.json()
    
    // Check if already enrolled
    const existingEnrollment = await prismaDB.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 })
    }

    const enrollment = await prismaDB.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        status: "enrolled"
      },
      include: {
        course: {
          include: {
            skill: true
          }
        }
      }
    })
    
    return NextResponse.json(enrollment)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
