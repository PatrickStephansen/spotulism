import { redirect } from "next/navigation";
import qs from "querystring";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export async function GET() {
  const antiForgeryToken = randomBytes(16).toString("hex");
  const queryString = qs.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: "streaming",
    redirect_uri:
      process.env.LOGIN_CALLBACK_URL ??
      "No callback URL configured. LOGIN_CALLBACK_URL is missing.",
    state: antiForgeryToken,
  });

  cookies().set({
    name: "SPOTIFY_LOGIN_ANTIFORGERY_TOKEN",
    value: antiForgeryToken,
    httpOnly: true,
  });

  redirect(`${process.env.SPOTIFY_AUTH_SERVICE_URL}/authorize?${queryString}`);
}
