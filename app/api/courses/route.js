import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET() {
  try {
    const courses = await prismaDB.course.findMany({
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            category: true
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
            enrollments: true,
            assignments: true
          }
        }
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    })
    
    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' }, 
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." }, 
        { status: 401 }
      )
    }

    const { title, description, skillId } = await request.json()
    
    // Validate required fields
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Course title is required" }, 
        { status: 400 }
      )
    }

    // Check if skill exists (if provided)
    if (skillId) {
      const skillExists = await prismaDB.skill.findUnique({
        where: { id: skillId }
      })
      
      if (!skillExists) {
        return NextResponse.json(
          { error: "Selected skill does not exist" }, 
          { status: 400 }
        )
      }
    }

    const course = await prismaDB.course.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        skillId: skillId || null,
        createdById: session.user.id,
        publishedAt: new Date()
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            category: true
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
            enrollments: true,
            assignments: true
          }
        }
      }
    })
    
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    
    // Handle duplicate course titles
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A course with this title already exists" }, 
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create course' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." }, 
        { status: 401 }
      )
    }

    const { id, title, description, skillId, publishedAt } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" }, 
        { status: 400 }
      )
    }

    // Check if course exists
    const existingCourse = await prismaDB.course.findUnique({
      where: { id }
    })
    
    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" }, 
        { status: 404 }
      )
    }

    const updatedCourse = await prismaDB.course.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(skillId !== undefined && { skillId: skillId || null }),
        ...(publishedAt !== undefined && { publishedAt: publishedAt ? new Date(publishedAt) : null })
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            category: true
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
            enrollments: true,
            assignments: true
          }
        }
      }
    })
    
    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('id')
    
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" }, 
        { status: 400 }
      )
    }

    // Check if course exists
    const existingCourse = await prismaDB.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            enrollments: true,
            assignments: true
          }
        }
      }
    })
    
    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" }, 
        { status: 404 }
      )
    }

    // Prevent deletion if course has enrollments
    if (existingCourse._count.enrollments > 0) {
      return NextResponse.json(
        { error: "Cannot delete course with existing enrollments" }, 
        { status: 409 }
      )
    }

    await prismaDB.course.delete({
      where: { id: courseId }
    })
    
    return NextResponse.json({ 
      message: "Course deleted successfully" 
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' }, 
      { status: 500 }
    )
  }
}
