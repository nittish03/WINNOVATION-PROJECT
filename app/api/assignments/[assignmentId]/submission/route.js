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
    let submission
    if (session.user.role === "admin") {
      // Admin can see all submissions
      const submissions = await prismaDB.submission.findMany({
        where: { assignmentId },
        include: { user: true },
        orderBy: { submittedAt: "desc" }
      })
      return NextResponse.json(submissions)
    } else {
      // Student can only see their own submission
      submission = await prismaDB.submission.findFirst({
        where: { 
          assignmentId,
          userId: session.user.id 
        },
        include: { assignment: true }
      })
      return NextResponse.json(submission)
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions, req)
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { assignmentId } = params
  const { content, fileUrl } = await req.json()

  try {
    // Check if assignment exists and is not past due
    const assignment = await prismaDB.assignment.findUnique({
      where: { id: assignmentId }
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    if (assignment.dueDate && new Date() > assignment.dueDate) {
      return NextResponse.json({ error: "Assignment is past due" }, { status: 400 })
    }

    // Check if student already submitted
    const existingSubmission = await prismaDB.submission.findFirst({
      where: { 
        assignmentId,
        userId: session.user.id 
      }
    })

    let submission
    if (existingSubmission) {
      // Update existing submission
      submission = await prismaDB.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content,
          fileUrl,
          submittedAt: new Date()
        }
      })
    } else {
      // Create new submission
      submission = await prismaDB.submission.create({
        data: {
          content,
          fileUrl,
          assignmentId,
          userId: session.user.id,
          submittedAt: new Date()
        }
      })
    }

    return NextResponse.json(submission)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
