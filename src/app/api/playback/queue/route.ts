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
  const [_, mediaType, mediaId] = mediaUri?.split(":") ?? [, ,];
  if (!["track", "album", "playlist", "artist"].includes(mediaType)) {
    return new NextResponse(
      JSON.stringify({ error: "missing or malformed uri" }),
      { status: 400 }
    );
  }
  const sdk = getSpotifySdk(getSpotifyUserTokenCookie());
  const itemsToAdd: string[] =
    mediaType === "track"
      ? [mediaUri]
      : mediaType === "album"
      ? await sdk.albums
          .tracks(mediaId, undefined, 0)
          .then((album) => album.items.map((track) => track.uri))
      : mediaType === "artist"
      ? await sdk.artists
          .topTracks(mediaId, "ZA")
          .then((artist) => artist.tracks.map((track) => track.uri))
      : mediaType === "playlist"
      ? await sdk.playlists
          .getPlaylistItems(mediaId, undefined, "items.track.uri", 10)
          .then((playlist) => playlist.items.map((item) => item.track.uri))
      : [];
  for (const item of itemsToAdd) {
    await sdk.player.addItemToPlaybackQueue(item);
  }
  const updatedQueue = await getQueueState();
  return NextResponse.json(updatedQueue);
}
