import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get URL search parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const courseId = searchParams.get('courseId')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50

    // Build where clause based on filters
    const where = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (courseId && courseId !== 'all') {
      where.courseId = courseId
    }

    // Get enrollments with user and course details
    const enrollments = await prismaDB.enrollment.findMany({
      where,
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
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            skill: {
              select: {
                name: true,
                category: true
              }
            },
            createdBy: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prismaDB.enrollment.count({ where })

    // Get enrollment statistics
    const stats = {
      total: totalCount,
      completed: await prismaDB.enrollment.count({ 
        where: { ...where, status: 'completed' }
      }),
      enrolled: await prismaDB.enrollment.count({ 
        where: { ...where, status: 'enrolled' }
      }),
      dropped: await prismaDB.enrollment.count({ 
        where: { ...where, status: 'dropped' }
      })
    }

    // Calculate average progress
    const avgProgressResult = await prismaDB.enrollment.aggregate({
      where,
      _avg: {
        progress: true
      }
    })

    return NextResponse.json({ 
      enrollments,
      stats: {
        ...stats,
        avgProgress: Math.round(avgProgressResult._avg.progress || 0)
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error in admin enrollments API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enrollmentId, status, progress } = await request.json()

    const enrollment = await prismaDB.enrollment.update({
      where: { id: enrollmentId },
      data: {
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
        ...(status === 'completed' && { completedAt: new Date() })
      },
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
      }
    })

    // If enrollment is completed, create certificate
    if (status === 'completed') {
      const existingCertificate = await prismaDB.certificate.findFirst({
        where: {
          userId: enrollment.userId,
          courseId: enrollment.courseId
        }
      })

      if (!existingCertificate) {
        await prismaDB.certificate.create({
          data: {
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            title: `Certificate of Completion - ${enrollment.course.title}`,
            url: `https://certificates.skillportal.com/${enrollment.userId}/${enrollment.courseId}`
          }
        })
      }
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('id')

    if (!enrollmentId) {
      return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 })
    }

    // Delete related certificates first
    await prismaDB.certificate.deleteMany({
      where: {
        userId: (await prismaDB.enrollment.findUnique({
          where: { id: enrollmentId },
          select: { userId: true, courseId: true }
        })).userId,
        courseId: (await prismaDB.enrollment.findUnique({
          where: { id: enrollmentId },
          select: { courseId: true }
        })).courseId
      }
    })

    // Delete the enrollment
    await prismaDB.enrollment.delete({
      where: { id: enrollmentId }
    })

    return NextResponse.json({ message: 'Enrollment deleted successfully' })
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}
