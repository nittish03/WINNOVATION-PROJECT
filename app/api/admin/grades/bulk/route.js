import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { grades } = await request.json()

    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json({ error: 'No grades provided' }, { status: 400 })
    }

    const createdGrades = await prismaDB.$transaction(
      grades.map(grade =>
        prismaDB.grade.upsert({
          where: {
            assignmentId_userId: {
              assignmentId: grade.assignmentId,
              userId: grade.userId,
            },
          },
          update: {
            points: grade.points,
            feedback: grade.feedback,
            gradedById: session.user.id,
          },
          create: {
            assignmentId: grade.assignmentId,
            userId: grade.userId,
            points: grade.points,
            feedback: grade.feedback,
            gradedById: session.user.id,
          },
        })
      )
    );

    return NextResponse.json(createdGrades)
  } catch (error) {
    console.error('Error creating bulk grades:', error)
    return NextResponse.json({ error: 'Failed to create grades' }, { status: 500 })
  }
}
