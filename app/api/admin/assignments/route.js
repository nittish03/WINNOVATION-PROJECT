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

    return NextResponse.json(assignments)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, courseId, dueDate, maxPoints } = await request.json()
    
    const assignment = await prismaDB.assignment.create({
      data: {
        title,
        description,
        courseId,
        dueDate: new Date(dueDate),
        maxPoints,
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
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
