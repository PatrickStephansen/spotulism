import {
  getSpotifySdk,
  getSpotifyUserTokenCookie,
} from "@/app/_lib/spotify-sdk";
import { trackOrEpisodeToPlayableTrack } from "@/app/_types/track";
import { NextResponse } from "next/server";

export async function GET() {
  const sdk = getSpotifySdk(getSpotifyUserTokenCookie());
  const queue = await sdk.player.getUsersQueue();
  const items = queue.currently_playing
    ? [
        trackOrEpisodeToPlayableTrack(queue.currently_playing),
        ...queue.queue.map(trackOrEpisodeToPlayableTrack),
      ]
    : [];
  return NextResponse.json(items);
}
