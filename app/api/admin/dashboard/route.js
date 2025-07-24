import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts for basic statistics
    const [
      totalUsers,
      totalStudents, 
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalSkills,
      totalEnrollments,
      completedEnrollments,
      totalAssignments,
      totalCertificates
    ] = await Promise.all([
      prismaDB.user.count(),
      prismaDB.user.count({ where: { role: 'student' } }),
      prismaDB.user.count({ where: { role: 'instructor' } }),
      prismaDB.course.count(),
      prismaDB.course.count({ where: { publishedAt: { not: null } } }),
      prismaDB.skill.count(),
      prismaDB.enrollment.count(),
      prismaDB.enrollment.count({ where: { status: 'completed' } }),
      prismaDB.assignment.count(),
      prismaDB.certificate.count()
    ])

    // Get recent users for dashboard display
    const recentUsers = await prismaDB.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get recent enrollments
    const recentEnrollments = await prismaDB.enrollment.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
      take: 5
    })

    // Calculate growth percentages (mock data for now)
    const stats = {
      totalUsers,
      totalStudents,
      totalInstructors,
      activeCourses: publishedCourses,
      totalCourses,
      draftCourses: totalCourses - publishedCourses,
      totalSkills,
      totalEnrollments,
      completedEnrollments,
      inProgressEnrollments: totalEnrollments - completedEnrollments,
      totalAssignments,
      totalCertificates,
      avgProgress: totalEnrollments > 0 
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0,
      // Mock growth data - in real app, you'd calculate from historical data
      userGrowth: Math.floor(Math.random() * 20) + 5,
      courseGrowth: Math.floor(Math.random() * 15) + 3,
      enrollmentGrowth: Math.floor(Math.random() * 25) + 8
    }

    const recent = {
      recentUsers,
      recentEnrollments
    }

    return NextResponse.json({ stats, recent })
  } catch (error) {
    console.error('Error in admin dashboard API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}
