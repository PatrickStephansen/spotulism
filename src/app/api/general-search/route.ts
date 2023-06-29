import { getSpotifySdk } from "@/app/_lib/spotify-sdk";
import { SearchMatch } from "@/app/_types/search";
import { ItemTypes } from "@spotify/web-api-ts-sdk/dist/mjs/types";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userAccessToken = JSON.parse(cookies().get("SPOTIFY_USER_TOKEN")?.value ?? "{}");
  if (!userAccessToken) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    const spotifyApi = getSpotifySdk(userAccessToken);
    const searchResults = await spotifyApi.search(
      request.nextUrl.searchParams.get("term") ?? "",
      (request.nextUrl.searchParams.getAll("types") as ItemTypes[]) ?? [
        "album",
        "artist",
        "playlist",
        "track",
        "show",
        "episode",
        "audiobook",
      ]
    );
    const responseBody: SearchMatch = {songs: searchResults.tracks.items};
    return new NextRequest(JSON.stringify(responseBody));
  } catch (error: any) {
    return new NextResponse(error?.message ?? "Something went wrong", {
      status: 500,
    });
  }
}
