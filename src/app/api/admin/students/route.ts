import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = buildApiUrl('/admin/students');
    const contentType = request.headers.get('content-type') || '';
    let fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    };

    if (contentType.includes('application/json')) {
      const jsonBody = await request.json();
      fetchOptions = {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonBody),
      };
    } else {
      const formData = await request.formData();
      fetchOptions = {
        ...fetchOptions,
        body: formData,
      };
    }

    const resp = await fetch(backendUrl, fetchOptions);

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
