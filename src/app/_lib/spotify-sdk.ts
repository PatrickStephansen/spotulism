import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { AccessToken } from "@spotify/web-api-ts-sdk/dist/mjs/types";
import { cookies } from "next/headers";

// copied from sdk internals: AccessTokenHelpers class
const refreshToken = async (clientId: string, refreshToken: string) => {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const text = await result.text();
  if (!result.ok) {
    throw new Error(`Failed to refresh token: ${result.statusText}, ${text}`);
  }
  const json = JSON.parse(text);
  return { ...json, expires: Date.now() + json.expires_in * 1000 };
};

export const getSpotifySdk = (userToken: AccessToken) =>
  SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID ?? "", userToken, {
    fetch,
    async afterRequest(url, options, response) {
      if (!response.ok) return;
      try {
        // afterRequest is called synchronously, but since we've already done the request, the cache entry should be available and should be returned immediately
        const potentiallyRenewedToken =
          await this.cachingStrategy?.get<AccessToken>(
            "spotify-sdk:ProvidedAccessTokenStrategy:token"
          );
        const existingCookieToken = JSON.parse(
          cookies().get("SPOTIFY_USER_TOKEN")?.value ?? "{}"
        );
        if (
          potentiallyRenewedToken &&
          (existingCookieToken.access_token !==
            potentiallyRenewedToken.access_token ||
            existingCookieToken.refresh_token !==
              potentiallyRenewedToken.refresh_token)
        ) {
          cookies().set({
            name: "SPOTIFY_USER_TOKEN",
            value: JSON.stringify(potentiallyRenewedToken),
            httpOnly: false,
            sameSite: "strict",
          });
          console.log("updated Spotify cookie token");
        }
      } catch (error) {
        console.warn("access token cookie update failed", error);
      }
    },
  });

export const getSpotifyUserTokenCookie = () => {
  return JSON.parse(cookies().get("SPOTIFY_USER_TOKEN")?.value ?? "{}");
};
