import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'

export async function GET() {
  try {
    const skills = await prismaDB.skill.findMany({
      include: {
        _count: {
          select: {
            users: true,
            courses: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(skills)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
