import crypto from "crypto";
import { prisma } from "@/lib/db";
import type { VideoTutorial } from "@prisma/client";

const VIDEO_TUTORIAL_TABLE = "VideoTutorial";

function getVideoTutorialClient() {
  return (prisma as any).videoTutorial;
}

function ensureVideoTutorialModel(): boolean {
  return Boolean(getVideoTutorialClient());
}

export async function getVideos(): Promise<VideoTutorial[]> {
  const client = getVideoTutorialClient();
  if (client) {
    return client.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
  }

  const sql = `SELECT id, title, description, videoUrl, category, featured, createdAt, updatedAt
    FROM ${VIDEO_TUTORIAL_TABLE}
    ORDER BY featured DESC, createdAt DESC`;
  return prisma.$queryRawUnsafe<VideoTutorial[]>(sql);
}

export async function getVideoById(id: string): Promise<VideoTutorial | null> {
  const client = getVideoTutorialClient();
  if (client) {
    return client.findUnique({
      where: { id },
    });
  }

  const sql = `SELECT id, title, description, videoUrl, category, featured, createdAt, updatedAt
    FROM ${VIDEO_TUTORIAL_TABLE}
    WHERE id = ?
    LIMIT 1`;
  const results = await prisma.$queryRawUnsafe<VideoTutorial[]>(sql, id);

  return results[0] ?? null;
}

export async function createVideo(data: {
  title: string;
  description: string;
  videoUrl: string;
  category: string;
  featured: boolean;
}): Promise<VideoTutorial> {
  const client = getVideoTutorialClient();
  if (client) {
    return client.create({
      data: {
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        category: data.category,
        featured: data.featured,
      },
    });
  }

  const id = crypto.randomUUID();
  const now = new Date();
  const insertSql = `INSERT INTO ${VIDEO_TUTORIAL_TABLE}
      (id, title, description, videoUrl, category, featured, createdAt, updatedAt)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)`;
  await prisma.$executeRawUnsafe(insertSql, id, data.title, data.description, data.videoUrl, data.category, data.featured, now, now);

  return {
    id,
    title: data.title,
    description: data.description,
    videoUrl: data.videoUrl,
    category: data.category,
    featured: data.featured,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateVideo(id: string, data: {
  title: string;
  description: string;
  videoUrl: string;
  category: string;
  featured: boolean;
}): Promise<VideoTutorial> {
  const client = getVideoTutorialClient();
  if (client) {
    return client.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        category: data.category,
        featured: data.featured,
      },
    });
  }

  const updatedAt = new Date();
  const updateSql = `UPDATE ${VIDEO_TUTORIAL_TABLE}
    SET title = ?, description = ?, videoUrl = ?, category = ?, featured = ?, updatedAt = ?
    WHERE id = ?`;
  await prisma.$executeRawUnsafe(updateSql, data.title, data.description, data.videoUrl, data.category, data.featured, updatedAt, id);

  const video = await getVideoById(id);
  if (!video) {
    throw new Error("Video not found");
  }
  return video;
}

export async function deleteVideo(id: string): Promise<void> {
  const client = getVideoTutorialClient();
  if (client) {
    await client.delete({
      where: { id },
    });
    return;
  }

  const deleteSql = `DELETE FROM ${VIDEO_TUTORIAL_TABLE}
    WHERE id = ?`;
  await prisma.$executeRawUnsafe(deleteSql, id);
}
