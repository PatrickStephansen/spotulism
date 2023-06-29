import { getSpotifySdk } from "@/app/_lib/spotify-sdk";
import { UserProfile } from "@/app/_types/user-profile";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const userAccessToken = JSON.parse(cookies().get("SPOTIFY_USER_TOKEN")?.value ?? "null");
  if (!userAccessToken?.expires_in) {
    return new NextResponse(null, { status: 401 });
  }
  const spotifyApi = getSpotifySdk(userAccessToken);
  try {
    const profile = await spotifyApi.currentUser.profile();
    const primaryProfileImage = profile.images?.[0];
    const userProfile: UserProfile = {
      displayName: profile.display_name,
      imageUrl: primaryProfileImage.url,
      spotifyId: profile.id,
      spotifyWebUrl: profile.external_urls.spotify,
      spotifyApiUrl: profile.href,
    };

    return new NextResponse(JSON.stringify(userProfile));
  } catch (e: any) {
    return new NextResponse(e.message, { status: 500 });
  }
}
