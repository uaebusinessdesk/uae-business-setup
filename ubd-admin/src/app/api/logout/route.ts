import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the auth cookie
  const cookieStore = await cookies();
  cookieStore.delete('ubd-auth');

  return NextResponse.json({ success: true });
}
