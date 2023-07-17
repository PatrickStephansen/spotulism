import { getSpotifyUserTokenCookie } from "@/app/_lib/spotify-sdk";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = getSpotifyUserTokenCookie();
  const tokenResponse = await fetch(
    `${process.env.SPOTIFY_AUTH_SERVICE_URL}/api/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(
        token.refresh_token ?? ""
      )}`,
    }
  );
  if (!tokenResponse.ok) {
    return tokenResponse;
  }
  const newToken = await tokenResponse.json();
  if (newToken) {
    cookies().set({
      name: "SPOTIFY_USER_TOKEN",
      value: JSON.stringify(newToken),
      httpOnly: false,
      sameSite: "strict",
    });
  }
  return new NextResponse();
}
