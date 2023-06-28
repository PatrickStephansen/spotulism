import { fetchFromSpotify } from "@/app/_lib/fetch-from-spotify";
import { UserProfile } from "@/app/_types/user-profile";
import { NextResponse } from "next/server";

export async function GET() {
  const profileResponse = await fetchFromSpotify("/v1/me");
  if (profileResponse.status === 401) {
    return new NextResponse(null, {status: 401});
  }
  const profile = await profileResponse.json();
  const primaryProfileImage = profile.images?.[0];
  const userProfile: UserProfile = {
    displayName: profile.display_name,
    imageUrl: primaryProfileImage.url,
    spotifyId: profile.id,
    spotifyWebUrl: profile.external_urls.spotify,
    spotifyApiUrl: profile.href,
  };

  return new NextResponse(JSON.stringify(userProfile))
}
