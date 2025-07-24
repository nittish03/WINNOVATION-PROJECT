import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET(req) {
  const skills = await prismaDB.skill.findMany();
  return NextResponse.json(skills);
}

export async function POST(req) {
  const session = await getServerSession(authOptions, req);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, description } = await req.json();
  try {
    const skill = await prismaDB.skill.create({ data: { name, description } });
    return NextResponse.json(skill);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
