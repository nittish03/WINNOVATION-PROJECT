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

    const submission = await prismaDB.submission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId: assignmentId,
          userId: session.user.id
        }
      }
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params before accessing its properties
    const resolvedParams = await params
    const assignmentId = resolvedParams.id

    const { content, fileUrl } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Check if assignment exists and user is enrolled
    const assignment = await prismaDB.assignment.findUnique({
      where: { id: assignmentId }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const enrollment = await prismaDB.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: assignment.courseId
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create or update submission
    const submission = await prismaDB.submission.upsert({
      where: {
        assignmentId_userId: {
          assignmentId: assignmentId,
          userId: session.user.id
        }
      },
      update: {
        content,
        fileUrl: fileUrl || null,
        submittedAt: new Date()
      },
      create: {
        assignmentId: assignmentId,
        userId: session.user.id,
        content,
        fileUrl: fileUrl || null
      }
    })

    // Update course progress
    const totalAssignments = await prismaDB.assignment.count({
      where: { courseId: assignment.courseId }
    })

    const submittedAssignments = await prismaDB.submission.count({
      where: {
        user: { id: session.user.id },
        assignment: { courseId: assignment.courseId }
      }
    })

    const progress = totalAssignments > 0 ? (submittedAssignments / totalAssignments) * 100 : 0

    await prismaDB.enrollment.update({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: assignment.courseId
        }
      },
      data: { progress: Math.round(progress) }
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
