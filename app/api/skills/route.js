import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET() {
  try {
    const skills = await prismaDB.skill.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(skills)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, category } = await request.json()
    
    const skill = await prismaDB.skill.create({
      data: {
        name,
        description: description || null,
        category: category || "General"
      }
    })
    
    return NextResponse.json(skill)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
