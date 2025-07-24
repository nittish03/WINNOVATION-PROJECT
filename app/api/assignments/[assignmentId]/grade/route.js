import { NextResponse } from "next/server"
import { prismaDB } from "@/lib/prismaDB"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOption"

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions, req)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { assignmentId } = params

  try {
    if (session.user.role === "student") {
      // Student can only see their own grade
      const grade = await prismaDB.grade.findFirst({
        where: { 
          assignmentId,
          userId: session.user.id 
        },
        include: { assignment: true }
      })
      return NextResponse.json(grade)
    } else {
      // Admin can see all grades for the assignment
      const grades = await prismaDB.grade.findMany({
        where: { assignmentId },
        include: { user: true, assignment: true }
      })
      return NextResponse.json(grades)
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions, req)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { assignmentId } = params
  const { userId, points, feedback } = await req.json()

  try {
    const existingGrade = await prismaDB.grade.findFirst({
      where: { assignmentId, userId }
    })

    let grade
    if (existingGrade) {
      grade = await prismaDB.grade.update({
        where: { id: existingGrade.id },
        data: { points, feedback }
      })
    } else {
      grade = await prismaDB.grade.create({
        data: {
          assignmentId,
          userId,
          points,
          feedback,
          gradedById: session.user.id
        }
      })
    }

    return NextResponse.json(grade)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
