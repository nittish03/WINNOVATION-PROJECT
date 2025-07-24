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

    const body = await request.json()
    const { assignmentId, userId, points, feedback } = body

    // Validate required fields
    if (!assignmentId || !userId || points === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: assignmentId, userId, points' 
      }, { status: 400 })
    }

    // Verify assignment exists
    const assignment = await prismaDB.assignment.findUnique({
      where: { id: assignmentId }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify submission exists
    const submission = await prismaDB.submission.findUnique({
      where: { 
        assignmentId_userId: {
          assignmentId: assignmentId,
          userId: userId
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Validate points
    if (points < 0 || points > assignment.maxPoints) {
      return NextResponse.json({ 
        error: `Points must be between 0 and ${assignment.maxPoints}` 
      }, { status: 400 })
    }

    // Create or update grade
    const grade = await prismaDB.grade.upsert({
      where: {
        assignmentId_userId: {
          assignmentId: assignmentId,
          userId: userId
        }
      },
      update: {
        points: parseInt(points),
        feedback: feedback || null,
        gradedById: session.user.id,
        gradedAt: new Date()
      },
      create: {
        assignmentId: assignmentId,
        userId: userId,
        points: parseInt(points),
        feedback: feedback || null,
        gradedById: session.user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        gradedBy: {
          select: {
            name: true
          }
        }
      }
    })
    
    return NextResponse.json(grade)
  } catch (error) {
    console.error('Error creating/updating grade:', error)
    return NextResponse.json({ 
      error: 'Failed to submit grade',
      message: error.message || 'Unknown error'
    }, { status: 500 })
  }
}
