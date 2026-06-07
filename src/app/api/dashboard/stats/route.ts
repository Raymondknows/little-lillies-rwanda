import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the staff token from cookies
    const staffToken = request.cookies.get('schoolbase_staff')?.value;
    
    if (!staffToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3006';

    // Fetch dashboard data from backend
    const response = await fetch(`${BACKEND_URL}/api/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${staffToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Dashboard fetch failed:', response.status, await response.text());
      return NextResponse.json(
        { error: 'Failed to load dashboard data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
