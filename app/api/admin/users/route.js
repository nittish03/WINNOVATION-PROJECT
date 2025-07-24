import { prismaDB } from '@/lib/prismaDB'
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const users = await prismaDB.user.findMany({
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
