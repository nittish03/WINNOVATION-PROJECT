import { NextResponse } from 'next/server'
import {prismaDB} from '@/lib/prismaDB'

export async function GET() {
  const courses = await prismaDB.course.findMany({ include: { skill: true } })
  return NextResponse.json(courses)
}

export async function POST(request) {
  const { title, description, skillId, createdById } = await request.json()
  try {
    const course = await prismaDB.course.create({
      data: { title, description, skillId, createdById }
    })
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
