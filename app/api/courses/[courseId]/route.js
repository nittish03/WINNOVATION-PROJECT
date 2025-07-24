import { NextResponse } from "next/server"
import { prismaDB } from "@/lib/prismaDB"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOption"

export async function GET(req, { params }) {
  try {
    const { courseId } = params
    
    const course = await prismaDB.course.findUnique({
      where: { id: courseId },
      include: {
        skill: true,
        createdBy: {
          select: { name: true, email: true }
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
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = params
    const { title, description, skillId } = await req.json()

    const course = await prismaDB.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        skillId: skillId || null
      },
      include: {
        skill: true,
        createdBy: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = params

    await prismaDB.course.delete({
      where: { id: courseId }
    })

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
