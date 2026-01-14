import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/googleSearchConsole';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/seo/analytics?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/admin/seo/analytics?error=no_code', request.url)
    );
  }

  try {
    const tokens = await getAccessToken(code);

    // Store tokens in database using Prisma
    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date * 1000) : null;

    const existing = await db.googleAuthToken.findFirst();

    if (existing) {
      await db.googleAuthToken.update({
        where: { id: existing.id },
        data: {
          accessToken: tokens.access_token || '',
          refreshToken: tokens.refresh_token || null,
          expiresAt,
        },
      });
    } else {
      await db.googleAuthToken.create({
        data: {
          accessToken: tokens.access_token || '',
          refreshToken: tokens.refresh_token || null,
          expiresAt,
        },
      });
    }

    return NextResponse.redirect(
      new URL('/admin/seo/analytics?auth=success', request.url)
    );
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return NextResponse.redirect(
      new URL('/admin/seo/analytics?error=auth_failed', request.url)
    );
  }
}
