import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSkills = await prismaDB.userSkill.findMany({
      where: { userId: session.user.id },
      include: { skill: true },
      orderBy: { addedAt: 'desc' }
    })

    return NextResponse.json(userSkills)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skillId, level } = await request.json()

    if (!skillId || !level || level < 1 || level > 10) {
      return NextResponse.json({ error: 'Invalid skill or level' }, { status: 400 })
    }

    const existingUserSkill = await prismaDB.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId: skillId
        }
      }
    })

    let userSkill
    if (existingUserSkill) {
      userSkill = await prismaDB.userSkill.update({
        where: { id: existingUserSkill.id },
        data: { level },
        include: { skill: true }
      })
    } else {
      userSkill = await prismaDB.userSkill.create({
        data: {
          userId: session.user.id,
          skillId,
          level
        },
        include: { skill: true }
      })
    }

    return NextResponse.json(userSkill)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
