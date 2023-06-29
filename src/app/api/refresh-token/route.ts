import { getSpotifySdk } from "@/app/_lib/spotify-sdk";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const refreshToken = cookies().get("SPOTIFY_REFRESH_TOKEN")?.value;
  const tokenResponse = await fetch(
    `${process.env.SPOTIFY_AUTH_SERVICE_URL}/api/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(
        refreshToken ?? ""
      )}`,
    }
  );
  if (!tokenResponse.ok) {
    return tokenResponse;
  }
  const token = await tokenResponse.json();
  const { access_token, expires_in, refresh_token } = token;
  if (refresh_token) {
    cookies().set({
      name: "SPOTIFY_REFRESH_TOKEN",
      value: refresh_token,
      httpOnly: true,
    });
  }
  if (access_token) {
    cookies().set({
      name: "SPOTIFY_ACCESS_TOKEN",
      value: access_token,
      httpOnly: true,
      expires: new Date(Date.now() + expires_in * 1000),
    });
  }
  cookies().set({
    name: "SPOTIFY_USER_TOKEN",
    value: JSON.stringify(token),
    httpOnly: true
  });
  return new NextResponse();
}
