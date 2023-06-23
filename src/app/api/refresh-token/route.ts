import { cookies } from 'next/headers'
export default async function RefreshToken() {
  const refreshToken = cookies().get('SPOTIFY_REFRESH_TOKEN');
  
}
