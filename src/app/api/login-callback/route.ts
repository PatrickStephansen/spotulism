import { getSpotifySdk } from "@/app/_lib/spotify-sdk";
import { UserProfile } from "@/app/_types/user-profile";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.access_token) {
      return new NextResponse(
        JSON.stringify({
          message:
            "No access token. User must give permission through Spotify and do a full page reload.",
        }),
        { status: 401 }
      );
    }
    const sdk = getSpotifySdk(body);
    const profile = await sdk.currentUser.profile();
    const primaryProfileImage = profile.images?.[0];
    const userProfile: UserProfile = {
      displayName: profile.display_name,
      imageUrl: primaryProfileImage.url,
      spotifyId: profile.id,
      spotifyWebUrl: profile.external_urls.spotify,
      spotifyApiUrl: profile.href,
    };

    cookies().set({
      name: "SPOTIFY_USER_TOKEN",
      value: JSON.stringify(body),
      httpOnly: false,
      sameSite: "strict",
    });
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("error logging in", error);
  }
}
