import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'

export async function GET(request, { params }) {
  try {
    // Await params before accessing its properties
    const resolvedParams = await params
    const courseId = resolvedParams.id

    const course = await prismaDB.course.findUnique({
      where: { 
        id: courseId,
        publishedAt: { not: null }
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        skill: {
          select: {
            name: true,
            category: true,
            description: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
