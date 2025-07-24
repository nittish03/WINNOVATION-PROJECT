import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params before accessing its properties
    const resolvedParams = await params
    const assignmentId = resolvedParams.id

    const grade = await prismaDB.grade.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId: assignmentId,
          userId: session.user.id
        }
      },
      include: {
        gradedBy: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(grade)
  } catch (error) {
    console.error('Error fetching grade:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
