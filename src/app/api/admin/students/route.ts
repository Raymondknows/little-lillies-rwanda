import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = buildApiUrl('/admin/students');
    const contentType = request.headers.get('content-type') || '';
    const headers: Record<string, string> = {
      cookie: request.headers.get('cookie') || '',
    };
    let reqBody: any;

    if (contentType.includes('multipart/form-data')) {
      reqBody = await request.arrayBuffer();
      headers['Content-Type'] = contentType;
    } else if (contentType.includes('application/json')) {
      const jsonBody = await request.json();
      reqBody = JSON.stringify(jsonBody);
      headers['Content-Type'] = 'application/json';
    } else {
      const formData = await request.formData();
      reqBody = formData;
    }

    const resp = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: reqBody,
    });

    if (!resp.ok) {
      const error = await resp.json();
      return NextResponse.json(error, { status: resp.status });
    }

    const respBody = await resp.json();
    return NextResponse.json(respBody, { status: resp.status });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
