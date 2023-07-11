import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { LoginButton } from "../_components/login-button";
import { getSpotifySdk } from "../_lib/spotify-sdk";
import { UserProfile } from "../_types/user-profile";

export default async function Profile() {
  const userAccessToken = JSON.parse(
    cookies().get("SPOTIFY_USER_TOKEN")?.value ?? "null"
  );
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
    return (
      <div>
        Hey, you made it. Here's what I know about your profile:
        <pre>
          profile retrieved:
          {JSON.stringify(userProfile, null, 2)}
        </pre>
        <Image
          src={userProfile?.imageUrl ?? "/default-profile.png"}
          alt="user profile image"
          width={200}
          height={200}
        />
      </div>
    );
  } catch {
    return (
      <p>
        You must be logged in to see your profile. <LoginButton />
      </p>
    );
  }
}
