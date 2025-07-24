import { NextResponse } from 'next/server'
import { prismaDB } from '@/lib/prismaDB'
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/authOption'

export async function GET(req) {
  const session = await getServerSession(authOptions, req);
  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userSkills = await prismaDB.userSkill.findMany({
    where: { userId: session.user.id },
    include: { skill: true }
  });
  return NextResponse.json(userSkills);
}

export async function POST(req) {
  const session = await getServerSession(authOptions, req);
  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { skillId, level } = await req.json();
  const existing = await prismaDB.userSkill.findFirst({
    where: { userId: session.user.id, skillId }
  });
  let userSkill;
  if (existing) {
    userSkill = await prismaDB.userSkill.update({
      where: { id: existing.id }, data: { level }
    });
  } else {
    userSkill = await prismaDB.userSkill.create({
      data: { userId: session.user.id, skillId, level }
    });
  }
  return NextResponse.json(userSkill);
}
