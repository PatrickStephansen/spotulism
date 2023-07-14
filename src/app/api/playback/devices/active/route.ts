import {
  getSpotifySdk,
  getSpotifyUserTokenCookie,
} from "@/app/_lib/spotify-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const play = await request.json();
  const spotifySdk = getSpotifySdk(getSpotifyUserTokenCookie());
  await spotifySdk.player.transferPlayback([play.activeDeviceId], play.shouldPlay);
  return NextResponse.json(null, { status: 201 });
}
