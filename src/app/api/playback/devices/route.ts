import { getSpotifySdk } from "@/app/_lib/spotify-sdk";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const sdk = getSpotifySdk(
      JSON.parse(cookies().get("SPOTIFY_USER_TOKEN")?.value ?? "{}")
    );
    const devices = await sdk.player.getAvailableDevices();
    return NextResponse.json(devices.devices);
  } catch (error: any) {
    if (error?.message?.includes("expired token")) {
      return new NextResponse(error?.message, { status: 401 });
    }
    throw error;
  }
}
