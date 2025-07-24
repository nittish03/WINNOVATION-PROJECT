import { NextResponse } from 'next/server'
import {prismaDB} from '@/lib/prismaDB'

export async function GET() {
  const certificates = await prismaDB.certificate.findMany({ include: { user: true, course: true } })
  return NextResponse.json(certificates)
}

export async function POST(request) {
  const { userId, courseId, url } = await request.json()
  try {
    const certificate = await prismaDB.certificate.create({
      data: { userId, courseId, url }
    })
    return NextResponse.json(certificate)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
