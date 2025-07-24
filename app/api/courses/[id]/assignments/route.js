import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Await params before accessing its properties
    const resolvedParams = await params
    const courseId = resolvedParams.id

    const assignments = await prismaDB.assignment.findMany({
      where: { courseId: courseId },
      include: session?.user?.role === 'student' ? {
        submissions: {
          where: { userId: session.user.id },
          select: { id: true, submittedAt: true }
        }
      } : {},
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
