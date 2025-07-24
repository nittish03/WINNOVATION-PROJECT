import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET(req) {
  const session = await getServerSession(authOptions, req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const filter = session.user.role === 'admin' ? {} : { userId: session.user.id };
  const enrollments = await prismaDB.enrollment.findMany({
    where: filter, include: { user: true, course: true }
  });
  return NextResponse.json(enrollments);
}

export async function POST(req) {
  const session = await getServerSession(authOptions, req);
  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { courseId } = await req.json();
  try {
    const enrollment = await prismaDB.enrollment.create({
      data: { userId: session.user.id, courseId, status: "enrolled" }
    });
    return NextResponse.json(enrollment);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
