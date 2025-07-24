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

    const [users, courses, enrollments, skills] = await Promise.all([
      prismaDB.user.count(),
      prismaDB.course.count({ where: { publishedAt: { not: null } } }),
      prismaDB.enrollment.count({ where: { status: 'completed' } }),
      prismaDB.skill.findMany({
        include: {
          _count: { select: { users: true } }
        }
      })
    ])

    const analytics = {
      totalUsers: users,
      activeCourses: courses,
      completions: enrollments,
      engagementRate: Math.round((enrollments / users) * 100) || 0,
      skillsBreakdown: skills.map(skill => ({
        name: skill.name,
        count: skill._count.users,
        percentage: Math.round((skill._count.users / users) * 100) || 0
      })),
      popularCourses: [],
      recentActivity: []
    }
    
    return NextResponse.json(analytics)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
