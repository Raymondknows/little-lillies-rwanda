import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth";
import { getCurrentSchoolId } from "@/lib/school";
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { prisma } from "@/lib/db";

async function streamToBuffer(readable: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  try {
    const session = await getStaffSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const schoolId = await getCurrentSchoolId();
    const body = await request.json();
    const { key } = body;
    if (!key) return NextResponse.json({ message: "key required" }, { status: 400 });

    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION;
    const accessKey = process.env.S3_ACCESS_KEY_ID;
    const secret = process.env.S3_SECRET_ACCESS_KEY;
    const endpoint = process.env.S3_ENDPOINT || undefined;
    const publicBase = process.env.S3_PUBLIC_BASE_URL || undefined; // optional CDN base

    if (!bucket || !region || !accessKey || !secret) {
      return NextResponse.json({ message: "S3 not configured" }, { status: 500 });
    }

    const s3 = new S3Client({ region, endpoint, credentials: { accessKeyId: accessKey, secretAccessKey: secret } });

    // download original
    const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(getCmd);
    // @ts-ignore
    const bodyStream = response.Body;
    const buffer = await streamToBuffer(bodyStream);

    const MAX_BYTES = 3 * 1024 * 1024; // 3MB
    if (buffer.length > MAX_BYTES) {
      // remove original to avoid storing large files if desired
      try {
        const del = new DeleteObjectCommand({ Bucket: bucket, Key: key });
        await s3.send(del);
      } catch (e) {
        console.warn("Failed to delete oversized original:", e);
      }
      return NextResponse.json({ message: "Uploaded file too large (max 3MB)" }, { status: 413 });
    }

    // process sizes
    const sizes = [64, 200, 600];
    const outKeys: Record<string, string> = {};
    for (const size of sizes) {
      const resized = await sharp(buffer).resize(size, size, { fit: "cover" }).webp({ quality: 85 }).toBuffer();
      const outKey = key.replace("/original-", `/logo-${size}-`).replace(/\.[^.]+$/, `.webp`);
      const putCmd = new PutObjectCommand({ Bucket: bucket, Key: outKey, Body: resized, ContentType: "image/webp", ACL: "public-read" });
      await s3.send(putCmd);
      outKeys[`logo-${size}`] = outKey;
    }

    // Build public URL for chosen default size (200)
    const chosen = outKeys["logo-200"];
    let publicUrl: string;
    if (publicBase) {
      publicUrl = `${publicBase.replace(/\/$/,"")}/${chosen}`;
    } else {
      // default S3 URL
      publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${chosen}`;
    }

    // update DB
    await prisma.school.update({ where: { id: schoolId }, data: { logoUrl: publicUrl } });

    return NextResponse.json({ success: true, url: publicUrl, keys: outKeys });
  } catch (err) {
    console.error("Confirm error:", err);
    return NextResponse.json({ message: err instanceof Error ? err.message : "Confirm failed" }, { status: 500 });
  }
}
