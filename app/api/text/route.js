import { prismaDB } from "@/lib/prismaDB";
import { NextResponse } from "next/server";
import cache from "@/lib/cache";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId") || undefined;
    const key = `text:list${folderId ? `:folder:${folderId}` : ''}`;
    const files = await cache.wrap(key, 60_000, async () => {
  return await prismaDB.text.findMany({
        where: folderId ? { folderId } : undefined,
        orderBy: { dateUploaded: "desc" },
      });
    });
  const res = NextResponse.json({ success: true, data: files, status: 200 });
  // Do not cache GET at the browser level to ensure immediate reflection
  res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ success: false, message: "Error fetching files", status: 500 });
  }
}

export async function POST(req) {
    try {
  const { title, text, folderId } = await req.json();

        if (!text) {
            return NextResponse.json(
                { success: false, message: "No text provided." },
                { status: 400 }
            );
        }

  const newText = await prismaDB.text.create({
            data: {
                title,
                text,
                folderId: folderId || undefined,
            },
        });

  // Invalidate cached lists
  try { cache.invalidatePrefix("text:"); } catch {}

  const res = NextResponse.json(
            { success: true, message: "Text saved successfully!", data: newText },
            { status: 200 }
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { success: false, message: "Error saving text." },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "No ID provided" }, { status: 400 });
    }

  await prismaDB.text.delete({
      where: { id },
    });

  try { cache.invalidatePrefix("text:"); } catch {}

  const res = NextResponse.json({ success: true, message: "Text deleted successfully" }, { status: 200 });
  res.headers.set("Cache-Control", "no-store");
  return res;
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ success: false, message: "Error deleting text" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
  const { id, title, text, folderId } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "No ID provided" }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ success: false, message: "No text provided" }, { status: 400 });
    }

  const updatedText = await prismaDB.text.update({
      where: { id },
      data: {
        title,
        text,
        folderId: typeof folderId === 'string' && folderId.length ? folderId : null,
      },
    });

  try { cache.invalidatePrefix("text:"); } catch {}

  const res = NextResponse.json(
      { success: true, message: "Text updated successfully!", data: updatedText },
      { status: 200 }
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ success: false, message: "Error updating text" }, { status: 500 });
  }
}
