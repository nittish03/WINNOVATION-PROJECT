import { NextResponse } from 'next/server'
import {prismaDB} from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET: Return the profile of the currently logged-in user
export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await prismaDB.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      university: true,
      degree: true,
      branch: true,
      role: true
      // add any other fields you want to expose
    }
  })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  return NextResponse.json(user)
}

// PATCH: Update profile of the currently logged-in user
export async function PATCH(request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name, university, degree, branch, image } = await request.json()
  try {
    const updated = await prismaDB.user.update({
      where: { id: session.user.id },
      data: {
        name,
        university,
        degree,
        branch,
        image,
      }
    })
    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      image: updated.image,
      university: updated.university,
      degree: updated.degree,
      branch: updated.branch,
      role: updated.role
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
