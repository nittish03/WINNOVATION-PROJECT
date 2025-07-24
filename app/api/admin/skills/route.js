import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
