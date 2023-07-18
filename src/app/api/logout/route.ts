import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  cookies().delete("SPOTIFY_USER_TOKEN");
  return new NextResponse()
}
