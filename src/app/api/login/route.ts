import { NextResponse, NextRequest } from "next/server";
export async function GET(): Promise<NextResponse> {
  const spotifyAuthorizeUserRequest = new NextRequest({})
  const spotifyStartLoginResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SPOTIFY_API_URL}/authorize`
  );
  return NextResponse.json(await spotifyStartLoginResponse.json());
}
