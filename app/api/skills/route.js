import { NextResponse } from 'next/server'
import {prismaDB} from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const skills = await prismaDB.skill.findMany()
  return NextResponse.json(skills)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { name, description } = await request.json()
  try {
    const skill = await prismaDB.skill.create({ data: { name, description } })
    return NextResponse.json(skill)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
