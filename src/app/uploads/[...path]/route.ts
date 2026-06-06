import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getStudentPhotoFilePath } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;

    if (!apiBase) {
      throw new Error('NEXT_PUBLIC_API_URL is not defined');
    }

    const base = apiBase.replace(/\/$/, '');

    const url = new URL(request.url);
    const prefix = '/uploads/';
    const uploadPath = url.pathname.startsWith(prefix)
      ? url.pathname.slice(prefix.length)
      : '';

    if (!uploadPath) {
      return NextResponse.json(
        { error: 'Upload path required' },
        { status: 400 }
      );
    }

    const backendUrl = new URL(
      `/uploads/${uploadPath}`,
      base
    ).toString();

    try {
      const resp = await fetch(backendUrl, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
        redirect: 'follow',
      });

      const body = await resp.arrayBuffer();

      return new NextResponse(body, {
        status: resp.status,
        headers: resp.headers,
      });
    } catch (err) {
      console.warn('Backend fetch failed for upload; attempting local fallback', err);

      // Try to serve from local storage (dev fallback)
      const parts = uploadPath.split('/');
      const filename = parts[parts.length - 1] || '';
      const pupilId = filename.split('.')[0];
      const localPath = await getStudentPhotoFilePath(pupilId);
      if (localPath) {
        try {
          const buf = await fs.readFile(localPath);
          const ext = path.extname(localPath).slice(1).toLowerCase();
          const contentType = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg';
          return new NextResponse(buf, { status: 200, headers: { 'Content-Type': contentType } });
        } catch (readErr) {
          console.error('Failed to read local upload file', readErr);
        }
      }

      throw err;
    }

  } catch (err) {
    console.error('Proxy /uploads error:', err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}