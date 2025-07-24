import { NextResponse } from "next/server"
import { prismaDB } from "@/lib/prismaDB"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOption"

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assignmentId } = params
    const { content, fileUrl } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const assignment = await prismaDB.assignment.findUnique({
      where: { id: assignmentId }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    if (assignment.dueDate && new Date() > assignment.dueDate) {
      return NextResponse.json({ error: 'Assignment is past due' }, { status: 400 })
    }

    const existingSubmission = await prismaDB.submission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId: session.user.id
        }
      }
    })

    let submission
    if (existingSubmission) {
      submission = await prismaDB.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content,
          fileUrl: fileUrl || null,
          submittedAt: new Date()
        }
      })
    } else {
      submission = await prismaDB.submission.create({
        data: {
          content,
          fileUrl: fileUrl || null,
          assignmentId,
          userId: session.user.id
        }
      })
    }

    return NextResponse.json(submission)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
