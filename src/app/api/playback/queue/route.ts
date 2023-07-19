import { getQueueState } from "@/app/_lib/queue";
import {
  getSpotifySdk,
  getSpotifyUserTokenCookie,
} from "@/app/_lib/spotify-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const queue = await getQueueState();
  return NextResponse.json(queue);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const mediaUri = body.uri;
  const mediaType = mediaUri?.split(":")?.[1];
  if (
    !["track", "episode", "album", "playlist", "artist", "show"].includes(
      mediaType
    )
  ) {
    return new NextResponse(
      JSON.stringify({ error: "missing or malformed uri" }),
      { status: 400 }
    );
  }
  const sdk = getSpotifySdk(getSpotifyUserTokenCookie());
  const itemsToAdd: string[] = mediaType == "track" ? [mediaUri] : [];
  itemsToAdd.forEach(async item => {
    sdk.player.addItemToPlaybackQueue(item)
  });
  const updatedQueue = await getQueueState();
  return NextResponse.json(updatedQueue);
}
