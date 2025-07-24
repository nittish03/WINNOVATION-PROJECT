import { NextResponse } from "next/server"
import { prismaDB } from "@/lib/prismaDB"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOption"

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = params
    const { role } = await req.json()

    if (!['student', 'admin', 'faculty'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const updatedUser = await prismaDB.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
