import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First verify the assignment exists
    const assignment = await prismaDB.assignment.findUnique({
      where: { id: id },
      include: {
        course: {
          select: { 
            id: true,
            title: true 
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Get all submissions for this assignment
    const submissions = await prismaDB.submission.findMany({
      where: { assignmentId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            university: true,
            degree: true,
            branch: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })

    // Get grades separately to match the relationship
    const grades = await prismaDB.grade.findMany({
      where: { assignmentId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        gradedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Create a map of grades by userId for easy lookup
    const gradeMap = grades.reduce((acc, grade) => {
      acc[grade.userId] = grade
      return acc
    }, {})

    // Attach grades to submissions
    const submissionsWithGrades = submissions.map(submission => ({
      ...submission,
      grade: gradeMap[submission.userId] || null
    }))

    // Get enrollment count for this assignment's course
    const enrollmentCount = await prismaDB.enrollment.count({
      where: { courseId: assignment.courseId }
    })

    // Calculate submission statistics
    const stats = {
      totalSubmissions: submissions.length,
      gradedSubmissions: grades.length,
      pendingGrading: submissions.length - grades.length,
      enrolledStudents: enrollmentCount,
      submissionRate: enrollmentCount > 0 ? Math.round((submissions.length / enrollmentCount) * 100) : 0,
      averageScore: grades.length > 0 ? Math.round(grades.reduce((acc, g) => acc + g.points, 0) / grades.length) : null
    }

    return NextResponse.json({
      assignment,
      submissions: submissionsWithGrades,
      stats
    })
  } catch (error) {
    console.error('Error fetching assignment submissions:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    }, { status: 500 })
  }
}
