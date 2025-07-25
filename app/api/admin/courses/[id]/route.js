import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOptions'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { publishedAt } = await request.json()
    const { id } = await params;
    
    const course = await prismaDB.course.update({
      where: { id: id },
      data: { publishedAt }
    })
    
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, skillId } = await request.json()
    const { id } = await params;
    
    const course = await prismaDB.course.update({
      where: { id: id },
      data: { title, description, skillId }
    })
    
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params;
    await prismaDB.course.delete({
      where: { id: id }
    })
    
    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
