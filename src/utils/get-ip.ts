import { headers } from 'next/headers';

/**
 * Gets the client IP address from request headers.
 * Works in Server Actions and Route Handlers.
 */
export async function getClientIP(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for');
  
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    const parts = forwardedFor.split(',');
    const clientIP = parts[0]?.trim();
    if (clientIP) return clientIP;
  }
  
  const realIP = headerList.get('x-real-ip');
  if (typeof realIP === 'string' && realIP.length > 0) {
    return realIP.trim();
  }
  
  return '127.0.0.1';
}
