import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (error) {
    throw new Error("Error logging in", { cause: error });
  }
  if (cookies().get("SPOTIFY_LOGIN_ANTIFORGERY_TOKEN")?.value !== state) {
    throw new Error("Antiforgery missmatch");
  }

  const form = new FormData();
  form.set("code", code ?? "missing code - this should never happen");
  form.set("grant_type", "authorization_code");
  form.set(
    "redirect_uri",
    process.env.LOGIN_CALLBACK_URL ??
      "No callback URL configured. LOGIN_CALLBACK_URL is missing."
  );
  // get the token we need to make further API calls
  const tokenResponse = await fetch(
    `${process.env.SPOTIFY_AUTH_SERVICE_URL}/api/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: `grant_type=authorization_code&redirect_uri=${
        process.env.LOGIN_CALLBACK_URL ?? ""
      }&code=${code}`,
    }
  );
  if (!tokenResponse.ok) {
    throw new Error("invalid auth token", {
      cause: `${tokenResponse.statusText}: ${JSON.stringify(
        await tokenResponse.json()
      )}`,
    });
  }
  const token = await tokenResponse.json();
  cookies().delete("SPOTIFY_LOGIN_ANTIFORGERY_TOKEN");
  cookies().set({
    name: "SPOTIFY_USER_TOKEN",
    value: JSON.stringify(token),
    httpOnly: false,
  });
  redirect("/");
}
