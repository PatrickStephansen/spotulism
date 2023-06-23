import { cookies } from "next/headers";

export default async function Profile() {
  const profileResponse = await fetch(`${process.env.SPOTIFY_API_URL}/v1/me`, {
    headers: {
      Authorization: `Bearer ${cookies().get("SPOTIFY_ACCESS_TOKEN")?.value}`,
    },
  });

  const profileResponseBody = await profileResponse.json();

  return (
    <div>
      Hey, you made it. Here's what I know about your profile:
      <pre>
        profile retrieved:

        {JSON.stringify(profileResponseBody, null, 2)}
      </pre>
    </div>
  );
}
