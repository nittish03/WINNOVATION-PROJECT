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

    // Get current date and date ranges
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Basic counts
    const [
      totalUsers,
      totalUsersLastMonth,
      activeCourses,
      activeCoursesLastMonth,
      totalEnrollments,
      completedEnrollments,
      totalAssignments,
      totalSubmissions,
      totalGrades,
      totalCertificates
    ] = await Promise.all([
      prismaDB.user.count(),
      prismaDB.user.count({ where: { createdAt: { lt: lastMonth } } }),
      prismaDB.course.count({ where: { publishedAt: { not: null } } }),
      prismaDB.course.count({ where: { publishedAt: { not: null, lt: lastMonth } } }),
      prismaDB.enrollment.count(),
      prismaDB.enrollment.count({ where: { status: 'completed' } }),
      prismaDB.assignment.count(),
      prismaDB.submission.count(),
      prismaDB.grade.count(),
      prismaDB.certificate.count()
    ])

    // Calculate growth percentages
    const userGrowth = totalUsersLastMonth > 0 
      ? Math.round(((totalUsers - totalUsersLastMonth) / totalUsersLastMonth) * 100)
      : 0

    const courseGrowth = activeCoursesLastMonth > 0
      ? Math.round(((activeCourses - activeCoursesLastMonth) / activeCoursesLastMonth) * 100)
      : 0

    // Popular courses with enrollment data
    const popularCourses = await prismaDB.course.findMany({
      where: { publishedAt: { not: null } },
      include: {
        _count: {
          select: {
            enrollments: true,
            certificates: true
          }
        },
        skill: {
          select: { name: true }
        },
        createdBy: {
          select: { name: true }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 10
    })

    const coursesWithStats = popularCourses.map(course => ({
      id: course.id,
      title: course.title,
      skill: course.skill?.name || 'General',
      instructor: course.createdBy.name,
      enrollments: course._count.enrollments,
      completions: course._count.certificates,
      completionRate: course._count.enrollments > 0 
        ? Math.round((course._count.certificates / course._count.enrollments) * 100)
        : 0,
      createdAt: course.createdAt
    }))

    // Skills breakdown
    const skills = await prismaDB.skill.findMany({
      include: {
        _count: { 
          select: { 
            users: true,
            courses: true
          } 
        }
      },
      orderBy: {
        users: {
          _count: 'desc'
        }
      }
    })

    const skillsBreakdown = skills.slice(0, 10).map(skill => ({
      name: skill.name,
      category: skill.category,
      userCount: skill._count.users,
      courseCount: skill._count.courses,
      percentage: totalUsers > 0 ? Math.round((skill._count.users / totalUsers) * 100) : 0
    }))

    // User role distribution
    const usersByRole = await prismaDB.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    const roleDistribution = usersByRole.map(role => ({
      role: role.role,
      count: role._count.role,
      percentage: Math.round((role._count.role / totalUsers) * 100)
    }))

    // Recent activity (last 20 activities)
    const [recentUsers, recentEnrollments, recentSubmissions, recentCertificates] = await Promise.all([
      prismaDB.user.findMany({
        where: { createdAt: { gte: lastWeek } },
        select: { name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prismaDB.enrollment.findMany({
        where: { enrolledAt: { gte: lastWeek } },
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } }
        },
        orderBy: { enrolledAt: 'desc' },
        take: 5
      }),
      prismaDB.submission.findMany({
        where: { submittedAt: { gte: lastWeek } },
        include: {
          user: { select: { name: true } },
          assignment: { 
            select: { 
              title: true,
              course: { select: { title: true } }
            } 
          }
        },
        orderBy: { submittedAt: 'desc' },
        take: 5
      }),
      prismaDB.certificate.findMany({
        where: { issuedAt: { gte: lastWeek } },
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } }
        },
        orderBy: { issuedAt: 'desc' },
        take: 5
      })
    ])

    // Format recent activity
    const recentActivity = [
      ...recentUsers.map(user => ({
        type: 'user_registered',
        description: `${user.name} joined the platform`,
        time: user.createdAt,
        icon: 'user'
      })),
      ...recentEnrollments.map(enrollment => ({
        type: 'enrollment',
        description: `${enrollment.user.name} enrolled in ${enrollment.course.title}`,
        time: enrollment.enrolledAt,
        icon: 'book'
      })),
      ...recentSubmissions.map(submission => ({
        type: 'submission',
        description: `${submission.user.name} submitted ${submission.assignment.title}`,
        time: submission.submittedAt,
        icon: 'file'
      })),
      ...recentCertificates.map(cert => ({
        type: 'certificate',
        description: `${cert.user.name} completed ${cert.course.title}`,
        time: cert.issuedAt,
        icon: 'award'
      }))
    ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 20)

    // Monthly user growth data (last 6 months)
    const monthlyUserGrowth = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const usersInMonth = await prismaDB.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })
      
      monthlyUserGrowth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users: usersInMonth
      })
    }

    // Assignment completion rates
    const assignmentStats = await prismaDB.assignment.findMany({
      include: {
        _count: {
          select: {
            submissions: true,
            grades: true
          }
        },
        course: {
          select: {
            title: true,
            _count: {
              select: { enrollments: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const assignmentAnalytics = assignmentStats.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      course: assignment.course.title,
      enrolledStudents: assignment.course._count.enrollments,
      submissions: assignment._count.submissions,
      graded: assignment._count.grades,
      submissionRate: assignment.course._count.enrollments > 0
        ? Math.round((assignment._count.submissions / assignment.course._count.enrollments) * 100)
        : 0,
      gradingProgress: assignment._count.submissions > 0
        ? Math.round((assignment._count.grades / assignment._count.submissions) * 100)
        : 0
    }))

    // System health metrics
    const systemHealth = {
      database: 'healthy',
      apiResponse: 'fast',
      serverLoad: 'moderate',
      storage: 'good',
      lastUpdated: now.toISOString()
    }

    // Engagement metrics
    const engagementRate = totalUsers > 0 ? Math.round((totalEnrollments / totalUsers) * 100) : 0
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0
    const submissionRate = totalAssignments > 0 ? Math.round((totalSubmissions / totalAssignments) * 100) : 0

    const analytics = {
      // Key metrics
      totalUsers,
      activeCourses,
      completions: completedEnrollments,
      engagementRate,
      
      // Growth metrics
      userGrowth,
      courseGrowth,
      
      // Additional metrics
      totalEnrollments,
      totalAssignments,
      totalSubmissions,
      totalGrades,
      totalCertificates,
      completionRate,
      submissionRate,
      
      // Detailed data
      popularCourses: coursesWithStats,
      skillsBreakdown,
      roleDistribution,
      recentActivity,
      monthlyUserGrowth,
      assignmentAnalytics,
      systemHealth
    }
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch analytics',
      message: error.message 
    }, { status: 500 })
  }
}
