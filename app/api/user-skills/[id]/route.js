import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { level } = await request.json()
    
    if (typeof level !== 'number' || level < 1 || level > 10) {
      return NextResponse.json({ error: 'Level must be between 1 and 10' }, { status: 400 })
    }

    // Verify user owns this skill
    const userSkill = await prismaDB.userSkill.findUnique({
      where: { id: params.id }
    })

    if (!userSkill || userSkill.userId !== session.user.id) {
      return NextResponse.json({ error: 'User skill not found' }, { status: 404 })
    }

    const updatedUserSkill = await prismaDB.userSkill.update({
      where: { id: params.id },
      data: { level },
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
    })

    return NextResponse.json(updatedUserSkill)
  } catch (error) {
    console.error('Error updating user skill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns this skill
    const userSkill = await prismaDB.userSkill.findUnique({
      where: { id: params.id }
    })

    if (!userSkill || userSkill.userId !== session.user.id) {
      return NextResponse.json({ error: 'User skill not found' }, { status: 404 })
    }

    await prismaDB.userSkill.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'User skill deleted successfully' })
  } catch (error) {
    console.error('Error deleting user skill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
