import { redirect } from "next/navigation";
import { fetchFromSpotify } from "../lib/fetch-from-spotify";

export default async function Profile() {
  const profileResponse = await fetchFromSpotify('/v1/me');
  if (profileResponse.status===401){
    redirect("/api/login")
  }

  return (
    <div>
      Hey, you made it. Here's what I know about your profile:
      <pre>
        profile retrieved:

        {JSON.stringify(await profileResponse.json(), null, 2)}
      </pre>
    </div>
  );
}
