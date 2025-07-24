import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Get user's enrolled courses
    const enrollments = await prismaDB.enrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true }
    })
    
    const courseIds = enrollments.map(e => e.courseId)
    
    const assignments = await prismaDB.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: { select: { title: true } },
        submissions: {
          where: { userId: session.user.id },
          select: { id: true, submittedAt: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    // Add submission info to each assignment
    const assignmentsWithSubmissions = assignments.map(assignment => ({
      ...assignment,
      submission: assignment.submissions[0] || null
    }))

    return NextResponse.json(assignmentsWithSubmissions)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
