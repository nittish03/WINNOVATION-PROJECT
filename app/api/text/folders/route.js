import { NextResponse } from "next/server";
import { prismaDB } from "@/lib/prismaDB";
import cache from "@/lib/cache";

export async function GET() {
  try {
    const data = await cache.wrap("text:folders", 60_000, async () => {
  const folders = await prismaDB.textFolder.findMany({ orderBy: { createdAt: "desc" } });
      const textCounts = await Promise.all(
        folders.map((f) => prismaDB.text.count({ where: { folderId: f.id } }))
      );
      return folders.map((f, i) => ({
        id: f.id,
        name: f.name,
        createdAt: f.createdAt,
        textsCount: textCounts[i] || 0,
      }));
    });
    const res = NextResponse.json({ success: true, data }, { status: 200 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Text Folders GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Folder name is required" }, { status: 400 });
    }
  const folder = await prismaDB.textFolder.create({ data: { name: name.trim() } });
  try { cache.invalidatePrefix("text:"); cache.invalidatePrefix("text:folders"); } catch {}
    const res = NextResponse.json({ success: true, data: folder }, { status: 201 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Text Folders POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to create folder" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, name } = await req.json();
    if (!id || !name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Folder id and name are required" }, { status: 400 });
    }
  await prismaDB.textFolder.update({ where: { id }, data: { name: name.trim() } });
  try { cache.invalidatePrefix("text:"); cache.invalidatePrefix("text:folders"); } catch {}
    const res = NextResponse.json({ success: true, message: "Folder renamed" }, { status: 200 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Text Folders PUT error:", error);
    return NextResponse.json({ success: false, message: "Failed to rename folder" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, message: "Folder id is required" }, { status: 400 });
  const textCount = await prismaDB.text.count({ where: { folderId: id } });
  if (textCount > 0) {
      return NextResponse.json(
    { success: false, message: "Folder is not empty. Remove or move texts first." },
        { status: 400 }
      );
    }
  await prismaDB.textFolder.delete({ where: { id } });
  try { cache.invalidatePrefix("text:"); cache.invalidatePrefix("text:folders"); } catch {}
    const res = NextResponse.json({ success: true, message: "Folder deleted" }, { status: 200 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Text Folders DELETE error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete folder" }, { status: 500 });
  }
}
