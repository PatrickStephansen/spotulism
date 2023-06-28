import { redirect } from "next/navigation";
import { fetchFromSpotify } from "../_lib/fetch-from-spotify";
import Image from "next/image";

export default async function Profile() {
  const profileResponse = await fetchFromSpotify("/v1/me");
  if (profileResponse.status === 401) {
    redirect("/api/login");
  }
  const profile = await profileResponse.json();
  const primaryProfileImage = profile.images?.[0];

  return (
    <div>
      Hey, you made it. Here's what I know about your profile:
      <pre>
        profile retrieved:
        {JSON.stringify(profile, null, 2)}
      </pre>
      <Image
        src={primaryProfileImage?.url}
        alt="user profile image"
        width={primaryProfileImage?.width ?? 200}
        height={primaryProfileImage?.height ?? 200}
      />
    </div>
  );
}
