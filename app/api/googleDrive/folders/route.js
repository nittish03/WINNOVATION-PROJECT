import { NextResponse } from "next/server";
import { prismaDB } from "@/lib/prismaDB";
import cache from "@/lib/cache";
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

export async function GET() {
  try {
    const data = await cache.wrap("gdrive:folders", 60_000, async () => {
      const folders = await prismaDB.driveFolder.findMany({
        orderBy: { createdAt: "desc" },
      });
      const counts = await Promise.all(
        folders.map((f) => prismaDB.pdfDetails.count({ where: { folderId: f.id } }))
      );
      return folders.map((f, idx) => ({
        id: f.id,
        name: f.name,
        createdAt: f.createdAt,
        driveFolderId: f.driveFolderId || null,
        filesCount: counts[idx] || 0,
      }));
    });
  const res = NextResponse.json({ success: true, data }, { status: 200 });
  res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Folders GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, createDrive } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Folder name is required" }, { status: 400 });
    }
  const folder = await prismaDB.driveFolder.create({ data: { name: name.trim() } });

    // Optionally create Drive folder
    if (createDrive) {
      try {
  const parent = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const resp = await drive.files.create({
          requestBody: {
            name: folder.name,
            mimeType: "application/vnd.google-apps.folder",
            parents: parent ? [parent] : undefined,
          },
          fields: "id",
        });
  await prismaDB.driveFolder.update({ where: { id: folder.id }, data: { driveFolderId: resp.data.id } });
      } catch (e) {
        console.warn("Drive folder creation failed, proceeding without driveFolderId", e?.message || e);
      }
    }

  try { cache.invalidatePrefix("gdrive:folders"); } catch {}
  const res = NextResponse.json({ success: true, data: folder }, { status: 201 });
  res.headers.set("Cache-Control", "no-store");
  return res;
  } catch (error) {
    console.error("Folders POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to create folder" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, name } = await req.json();
    if (!id || !name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Folder id and name are required" }, { status: 400 });
    }
  await prismaDB.driveFolder.update({ where: { id }, data: { name: name.trim() } });
  try { cache.invalidatePrefix("gdrive:folders"); } catch {}
  const res = NextResponse.json({ success: true, message: "Folder renamed" }, { status: 200 });
  res.headers.set("Cache-Control", "no-store");
  return res;
  } catch (error) {
    console.error("Folders PUT error:", error);
    return NextResponse.json({ success: false, message: "Failed to rename folder" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, message: "Folder id is required" }, { status: 400 });

    const count = await prismaDB.pdfDetails.count({ where: { folderId: id } });
    if (count > 0) {
      return NextResponse.json(
        { success: false, message: "Folder is not empty. Delete or move files first." },
        { status: 400 }
      );
    }

    // Try to delete associated Drive folder if exists
  const folder = await prismaDB.driveFolder.findUnique({ where: { id } });
    if (folder?.driveFolderId) {
      try {
        await drive.files.delete({ fileId: folder.driveFolderId });
      } catch (e) {
        console.warn("Drive folder delete failed:", e?.message || e);
      }
    }

  await prismaDB.driveFolder.delete({ where: { id } });
  try { cache.invalidatePrefix("gdrive:folders"); } catch {}
  const res = NextResponse.json({ success: true, message: "Folder deleted" }, { status: 200 });
  res.headers.set("Cache-Control", "no-store");
  return res;
  } catch (error) {
    console.error("Folders DELETE error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete folder" }, { status: 500 });
  }
}
