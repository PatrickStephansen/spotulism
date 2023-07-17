import {
  getSpotifySdk,
  getSpotifyUserTokenCookie,
} from "@/app/_lib/spotify-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const body = await request.json();
  if (!body.contextUri) {
    return new NextResponse("Missing 'contextUri'");
  }
  console.log("try play media", body.contextUri);
  const sdk = getSpotifySdk(getSpotifyUserTokenCookie());
  if (body.contextUri.startsWith("spotify:track")) {
    return sdk.player.startResumePlayback(body.deviceId, undefined, [
      body.contextUri,
    ]);
  }
  return sdk.player.startResumePlayback(body.deviceId, body.contextUri);
}
