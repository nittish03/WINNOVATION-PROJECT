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

    let assignments

    if (session.user.role === 'admin') {
      // Admin sees all assignments
      assignments = await prismaDB.assignment.findMany({
        include: {
          course: {
            select: { title: true }
          },
          _count: {
            select: { submissions: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Students see assignments from their enrolled courses
      const enrollments = await prismaDB.enrollment.findMany({
        where: { userId: session.user.id },
        select: { courseId: true }
      })

      const courseIds = enrollments.map(e => e.courseId)

      assignments = await prismaDB.assignment.findMany({
        where: {
          courseId: { in: courseIds }
        },
        include: {
          course: {
            select: { title: true }
          },
          submissions: {
            where: { userId: session.user.id },
            select: {
              id: true,
              submittedAt: true
            }
          }
        },
        orderBy: { dueDate: 'asc' }
      })
    }

    return NextResponse.json(assignments)
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

    const { title, description, dueDate, maxPoints, courseId } = await request.json()

    const assignment = await prismaDB.assignment.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxPoints: maxPoints || 100,
        courseId,
        createdById: session.user.id
      },
      include: {
        course: {
          select: { title: true }
        }
      }
    })

    return NextResponse.json(assignment)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
