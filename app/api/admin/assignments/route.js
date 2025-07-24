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

    const assignments = await prismaDB.assignment.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            submissions: true,
            grades: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Ensure we always return a valid array
    return NextResponse.json(assignments || [])
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, courseId, dueDate, maxPoints } = body

    // Validate required fields
    if (!title || !courseId || !dueDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, courseId, dueDate' 
      }, { status: 400 })
    }

    // Verify course exists
    const course = await prismaDB.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    
    const assignment = await prismaDB.assignment.create({
      data: {
        title,
        description: description || null,
        courseId,
        dueDate: new Date(dueDate),
        maxPoints: maxPoints || 100,
        createdById: session.user.id
      },
      include: {
        course: {
          select: {
            title: true
          }
        },
        createdBy: {
          select: {
            name: true
          }
        }
      }
    })
    
    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ 
      error: 'Failed to create assignment',
      message: error.message || 'Unknown error'
    }, { status: 500 })
  }
}
