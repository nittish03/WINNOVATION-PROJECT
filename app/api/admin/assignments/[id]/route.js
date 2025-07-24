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

    const assignment = await prismaDB.assignment.findUnique({
      where: { id: id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                university: true
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        },
        grades: {
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
        },
        _count: {
          select: {
            submissions: true,
            grades: true
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching assignment details:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, courseId, dueDate, maxPoints } = body

    // Check if assignment exists
    const existingAssignment = await prismaDB.assignment.findUnique({
      where: { id: id }
    })

    if (!existingAssignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const updatedAssignment = await prismaDB.assignment.update({
      where: { id: id },
      data: {
        title: title || existingAssignment.title,
        description: description !== undefined ? description : existingAssignment.description,
        courseId: courseId || existingAssignment.courseId,
        dueDate: dueDate ? new Date(dueDate) : existingAssignment.dueDate,
        maxPoints: maxPoints !== undefined ? maxPoints : existingAssignment.maxPoints,
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
    
    return NextResponse.json(updatedAssignment)
  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json({ 
      error: 'Failed to update assignment',
      message: error.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if assignment exists
    const existingAssignment = await prismaDB.assignment.findUnique({
      where: { id: id }
    })

    if (!existingAssignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    await prismaDB.assignment.delete({
      where: { id: id }
    })
    
    return NextResponse.json({ message: 'Assignment deleted successfully' })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json({ 
      error: 'Failed to delete assignment',
      message: error.message || 'Unknown error'
    }, { status: 500 })
  }
}
