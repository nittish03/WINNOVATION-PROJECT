import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, email, role, university, degree, branch } = await request.json()
    
    const hashedPassword = await bcrypt.hash('password123', 10) // Default password
    
    const user = await prismaDB.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role,
        university,
        degree,
        branch
      }
    })
    
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
