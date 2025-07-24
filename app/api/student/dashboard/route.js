import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Session user:', session.user) // Debug log

    // Use a more robust approach to get user data
    const userId = session.user.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 })
    }

    const [enrollments, userSkills, certificates] = await Promise.all([
      prismaDB.enrollment.findMany({
        where: { userId: userId },
        include: {
          course: {
            select: { 
              id: true,
              title: true,
              description: true,
              createdAt: true
            }
          }
        },
        orderBy: { enrolledAt: 'desc' },
        take: 5
      }),
      prismaDB.userSkill.findMany({
        where: { userId: userId },
        include: {
          skill: {
            select: {
              name: true,
              category: true
            }
          }
        }
      }),
      prismaDB.certificate.findMany({
        where: { userId: userId }
      })
    ])

    const stats = {
      enrolledCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      inProgressCourses: enrollments.filter(e => e.status === 'enrolled').length,
      totalSkills: userSkills.length,
      certificates: certificates.length,
      avgProgress: enrollments.length > 0 
        ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
        : 0
    }

    const recent = {
      recentCourses: enrollments.slice(0, 3)
    }

    return NextResponse.json({ stats, recent })
  } catch (error) {
    console.error('Error in student dashboard API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}
