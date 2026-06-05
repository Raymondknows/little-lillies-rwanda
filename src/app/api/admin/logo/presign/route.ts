import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth";
import { getCurrentSchoolId } from "@/lib/school";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(request: Request) {
  try {
    const session = await getStaffSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const schoolId = await getCurrentSchoolId();

    const body = await request.json();
    const { fileName, contentType, fileSize } = body;
    const MAX_BYTES = 3 * 1024 * 1024; // 3MB
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!fileName || !contentType) {
      return NextResponse.json({ message: "fileName and contentType required" }, { status: 400 });
    }

    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json({ message: "Invalid contentType" }, { status: 400 });
    }

    if (typeof fileSize === "number" && fileSize > MAX_BYTES) {
      return NextResponse.json({ message: "File too large (max 3MB)" }, { status: 413 });
    }

    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION;
    const accessKey = process.env.S3_ACCESS_KEY_ID;
    const secret = process.env.S3_SECRET_ACCESS_KEY;
    const endpoint = process.env.S3_ENDPOINT || undefined;

    if (!bucket || !region || !accessKey || !secret) {
      return NextResponse.json({ type: "local", uploadUrl: "/api/admin/logo/upload", method: "POST" });
    }

    const s3 = new S3Client({ region, endpoint, credentials: { accessKeyId: accessKey, secretAccessKey: secret } });

    const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1] : "png";
    const key = `schools/${schoolId}/logo/original-${Date.now()}.${ext}`;

    const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ACL: "private" });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 });

    return NextResponse.json({ url, key, method: "PUT" });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json({ message: err instanceof Error ? err.message : "Presign failed" }, { status: 500 });
  }
}
