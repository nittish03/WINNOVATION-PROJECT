import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const enrollments = await prismaDB.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            createdBy: { select: { name: true } },
            skill: { select: { name: true, category: true } }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })
    return NextResponse.json(enrollments)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { courseId } = await request.json()
    
    const enrollment = await prismaDB.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        status: 'enrolled',
        progress: 0
      }
    })
    return NextResponse.json(enrollment)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
