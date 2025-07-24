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

    const certificates = await prismaDB.certificate.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: {
            title: true,
            skill: { select: { name: true, category: true } }
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    })
    return NextResponse.json(certificates)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
