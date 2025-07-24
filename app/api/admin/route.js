import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prismaDB.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        university: true,
        degree: true,
        branch: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            skills: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
