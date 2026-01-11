import { cookies } from 'next/headers';

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('ubd-auth')?.value;
    return authCookie === 'authenticated';
  } catch {
    return false;
  }
}
