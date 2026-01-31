import { cookies } from 'next/headers'

/**
 * Convert Next.js cookies to Headers format for Payload auth
 */
export async function getAuthHeaders(): Promise<Headers> {
  const cookieStore = await cookies()
  const headers = new Headers()
  
  // Copy all cookies to headers
  cookieStore.getAll().forEach((cookie) => {
    headers.append('Cookie', `${cookie.name}=${cookie.value}`)
  })
  
  return headers
}
