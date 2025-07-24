import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function GET() {
  const enrollments = await prisma.enrollment.findMany({ include: { user: true, course: true } })
  return NextResponse.json(enrollments)
}

export async function POST(request) {
  const { userId, courseId, status } = await request.json()
  try {
    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId, status }
    })
    return NextResponse.json(enrollment)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
