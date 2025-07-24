import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const userSkills = await prismaDB.userSkill.findMany({
      where: { userId: session.user.id },
      include: {
        skill: true
      },
      orderBy: { addedAt: 'desc' }
    })
    return NextResponse.json(userSkills)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { skillId, level } = await request.json()
    
    const userSkill = await prismaDB.userSkill.create({
      data: {
        userId: session.user.id,
        skillId,
        level: parseInt(level)
      }
    })
    return NextResponse.json(userSkill)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
