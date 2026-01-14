import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/googleSearchConsole';

export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL. Check Google OAuth credentials.' },
      { status: 500 }
    );
  }
}
