import { NextResponse } from "next/server"
import { prismaDB } from "@/lib/prismaDB"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOption"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = params

    const assignments = await prismaDB.assignment.findMany({
      where: { courseId },
      include: {
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = params
    const { title, description, dueDate, maxPoints } = await req.json()

    const assignment = await prismaDB.assignment.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxPoints: maxPoints || 100,
        courseId,
        createdById: session.user.id
      }
    })

    return NextResponse.json(assignment)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
