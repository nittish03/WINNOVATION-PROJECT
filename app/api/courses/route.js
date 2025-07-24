import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET(req) {
  const courses = await prismaDB.course.findMany({ include: { skill: true } });
  return NextResponse.json(courses);
}

export async function POST(req) {
  const session = await getServerSession(authOptions, req);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description, skillId } = await req.json();
  try {
    const course = await prismaDB.course.create({
      data: { title, description, skillId, createdById: session.user.id }
    });
    return NextResponse.json(course);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
