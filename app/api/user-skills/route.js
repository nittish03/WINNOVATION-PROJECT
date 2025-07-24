import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSkills = await prismaDB.userSkill.findMany({
      where: { userId: session.user.id },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true
          }
        }
      },
      orderBy: { addedAt: 'desc' }
    })

    return NextResponse.json(userSkills)
  } catch (error) {
    console.error('Error fetching user skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skills } = await request.json()
    
    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: 'Skills array is required' }, { status: 400 })
    }

    // Create user skills with default level of 1
    const userSkills = await Promise.all(
      skills.map(skillId =>
        prismaDB.userSkill.create({
          data: {
            userId: session.user.id,
            skillId: skillId,
            level: 1
          },
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true
              }
            }
          }
        }).catch(error => {
          // Handle duplicate key errors gracefully
          if (error.code === 'P2002') {
            return null
          }
          throw error
        })
      )
    )

    const validUserSkills = userSkills.filter(Boolean)
    
    return NextResponse.json(validUserSkills)
  } catch (error) {
    console.error('Error adding user skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
