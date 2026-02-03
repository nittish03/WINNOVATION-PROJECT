import { prismaDB } from "@/lib/prismaDB";
import { NextResponse } from "next/server";
import cache from "@/lib/cache";
import { google } from "googleapis";
import { Readable } from "stream";
import bcrypt from "bcryptjs";

if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
  throw new Error("Missing Google Drive API credentials");
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

async function ensureDriveFolderForFolderRecord(folder) {
  // Create corresponding Google Drive folder if missing
  if (folder.driveFolderId) return folder.driveFolderId;
  const FOLDER_MIME = "application/vnd.google-apps.folder";
  const ROOT_PARENT = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const resp = await drive.files.create({
    requestBody: {
      name: folder.name,
      mimeType: FOLDER_MIME,
      parents: ROOT_PARENT ? [ROOT_PARENT] : undefined,
    },
    fields: "id",
  });
  const driveFolderId = resp.data.id;
  await prismaDB.driveFolder.update({
    where: { id: folder.id },
    data: { driveFolderId },
  });
  return driveFolderId;
}

export async function GET(req) {
  try {
  const url = new URL(req.url);
    const folderId = url.searchParams.get("folderId");
  const cacheKey = `gdrive:list:${folderId || 'all'}`;
  const files = await cache.wrap(cacheKey, 60_000, async () => (
    await prismaDB.pdfDetails.findMany({
      where: folderId ? { folderId } : undefined,
      orderBy: { dateUploaded: "desc" },
      select: {
        id: true,
        title: true,
        pdf: true,
        type: true,
        dateUploaded: true,
    folderId: true,
    password: true,
      },
    })
  ));

    // Password is not returned; only expose if protected status
    const safeFiles = files.map(({ password, ...rest }) => ({
      ...rest,
      isProtected: !!password,
    }));

  const res = NextResponse.json({ success: true, data: safeFiles }, { status: 200 });
  res.headers.set("Cache-Control", "no-store");
  return res;
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching files" },
      { status: 500 }
    );
  }
}

// Enhanced POST for chunked upload with proper resume support
export async function POST(req) {
  try {
    const formData = await req.formData();
    const chunk = formData.get("chunk");
    const chunkIndex = parseInt(formData.get("chunkIndex"));
    const totalChunks = parseInt(formData.get("totalChunks"));
    const fileName = formData.get("fileName");
    const uploadId = formData.get("uploadId");
    const title = formData.get("title");
    const password = formData.get("password");
    const fileType = formData.get("fileType");
    const resumeFromChunk = parseInt(formData.get("resumeFromChunk") || "0");
  const folderId = formData.get("folderId");

    if (!chunk || chunkIndex === undefined || !totalChunks || !fileName || !uploadId) {
      return NextResponse.json(
        { success: false, message: "Missing chunk data" },
        { status: 400 }
      );
    }

    // Store chunk temporarily
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    
    global.uploadChunks = global.uploadChunks || {};
    global.uploadChunks[uploadId] = global.uploadChunks[uploadId] || {};
    global.uploadChunks[uploadId][chunkIndex] = chunkBuffer;

    console.log(`Received chunk ${chunkIndex + 1}/${totalChunks} for upload ${uploadId}`);

    // Check if all chunks are received
    const receivedChunks = Object.keys(global.uploadChunks[uploadId]).length;
    
    if (receivedChunks === totalChunks) {
      console.log(`All chunks received for ${uploadId}, combining and uploading to Drive`);
      
      // Combine all chunks in correct order
      const combinedBuffer = Buffer.concat(
        Array.from({ length: totalChunks }, (_, i) => global.uploadChunks[uploadId][i])
      );

      // Upload to Google Drive
      const stream = Readable.from(combinedBuffer);

      // Determine parent folder in Drive
      let parentDriveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      let parentIds = parentDriveFolderId ? [parentDriveFolderId] : undefined;
      if (folderId) {
  const folder = await prismaDB.driveFolder.findUnique({ where: { id: folderId } });
        if (folder) {
          const driveFolderId = await ensureDriveFolderForFolderRecord(folder);
          parentIds = [driveFolderId];
        }
      }

      const uploadResponse = await drive.files.create({
        requestBody: {
          name: title || fileName,
          parents: parentIds,
        },
        media: {
          mimeType: fileType,
          body: stream,
        },
        fields: "id, webViewLink",
      });

      const fileId = uploadResponse.data.id;

      await drive.permissions.create({
        fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      let hashedPassword = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }

      const newFile = await prismaDB.pdfDetails.create({
        data: {
          title: title || fileName,
          pdf: uploadResponse.data.webViewLink,
          type: fileType || "unknown",
          driveFileId: fileId,
          password: hashedPassword,
          folderId: folderId || null,
        },
      });

      try {
        cache.invalidatePrefix("gdrive:list:");
      } catch {}

      // Clean up chunks
      delete global.uploadChunks[uploadId];

      console.log(`Upload completed for ${uploadId}`);

  const res = NextResponse.json(
        {
          success: true,
          message: "File uploaded successfully!",
          data: newFile,
          completed: true,
        },
        { status: 200 }
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
    }

  const res = NextResponse.json(
      {
        success: true,
        message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded`,
        progress: (receivedChunks / totalChunks) * 100,
        completed: false,
      },
      { status: 200 }
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Error uploading chunk" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { id, password, title } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "File ID is required" },
        { status: 400 }
      );
    }

    const file = await prismaDB.pdfDetails.findUnique({ where: { id } });

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    // Handle title update
    if (title) {
  await prismaDB.pdfDetails.update({
        where: { id },
        data: { title },
      });
  try { cache.invalidatePrefix("gdrive:list:"); } catch {}

      if (file.driveFileId) {
        await drive.files.update({
          fileId: file.driveFileId,
          requestBody: {
            name: title,
          },
        });
      }
      
  const res = NextResponse.json(
        { success: true, message: "Title updated successfully" },
        { status: 200 }
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
    }

    // Handle password verification
    if (password) {
      if (!file.password) {
        return NextResponse.json(
          { success: true, fileUrl: file.pdf },
          { status: 200 }
        );
      }

      const isMatch = await bcrypt.compare(password, file.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "Incorrect password" },
          { status: 401 }
        );
      }

  const res = NextResponse.json(
        { success: true, fileUrl: file.pdf },
        { status: 200 }
  );
  res.headers.set("Cache-Control", "private, max-age=60");
  return res;
    }

  const res = NextResponse.json(
      { success: false, message: "No action performed" },
      { status: 400 }
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
  } catch (error) {
    console.error("Update/Access error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "File ID is required" },
        { status: 400 }
      );
    }

    const file = await prismaDB.pdfDetails.findUnique({ where: { id } });

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    if (file.driveFileId) {
      await drive.files.delete({ fileId: file.driveFileId }).catch((err) => {
        console.error("Google Drive delete error:", err);
      });
    }

  await prismaDB.pdfDetails.delete({ where: { id } });

  try { cache.invalidatePrefix("gdrive:list:"); } catch {}

  const res = NextResponse.json(
      { success: true, message: "File deleted successfully" },
      { status: 200 }
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting file" },
      { status: 500 }
    );
  }
}
