import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const backendUrl = buildApiUrl('/admin/students');

    const resp = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      body: formData,
    });

    if (!resp.ok) {
      const error = await resp.json();
      return NextResponse.json(error, { status: resp.status });
    }

    const body = await resp.json();
    return NextResponse.json(body, { status: resp.status });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
