export async function POST() {
  const response = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  // Clear auth cookies
  response.headers.append('Set-Cookie', 'schoolbase_staff=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax');
  response.headers.append('Set-Cookie', 'schoolbase_parent=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax');

  return response;
}
