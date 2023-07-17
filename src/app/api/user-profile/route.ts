import {
  getSpotifySdk,
  getSpotifyUserTokenCookie,
} from "@/app/_lib/spotify-sdk";
import { UserProfile } from "@/app/_types/user-profile";
import { NextResponse } from "next/server";

export async function GET() {
  const spotifyApi = getSpotifySdk(getSpotifyUserTokenCookie());
  try {
    const profile = await spotifyApi.currentUser.profile();
    const primaryProfileImage = profile.images.reduce(
      (biggestImage, nextImage) =>
        biggestImage.width * biggestImage.height <
        nextImage.width * nextImage.height
          ? nextImage
          : biggestImage,
      { width: 0, height: 0, url: "/default-profile.png" }
    );
    const userProfile: UserProfile = {
      displayName: profile.display_name,
      imageUrl: primaryProfileImage.url,
      spotifyId: profile.id,
      spotifyWebUrl: profile.external_urls.spotify,
      spotifyApiUrl: profile.href,
    };

    return NextResponse.json(userProfile);
  } catch (e: any) {
    return new NextResponse(e.message, { status: 500 });
  }
}
