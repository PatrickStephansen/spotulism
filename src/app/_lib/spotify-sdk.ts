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

const createRefreshTokenErrorHandler = (currentToken: AccessToken) => ({
  async handleErrors(error: any): Promise<boolean> {
    if (error?.message?.includes("expired token")) {
      try {
        const newToken = await refreshToken(
          process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "",
          currentToken.refresh_token
        );
        console.log(
          "refreshed token on error, but don't know what to do now",
          newToken
        );
        cookies().set({
          name: "SPOTIFY_USER_TOKEN",
          value: JSON.stringify(newToken),
          httpOnly: false,
          sameSite: "strict",
        });
        return true;
      } catch (error) {
        console.error("Error trying to refresh token", error);
      }
    }
    return false;
  },
});

export const getSpotifySdk = (userToken: AccessToken) =>
  SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID ?? "", userToken, {
    fetch,
    errorHandler: createRefreshTokenErrorHandler(userToken),
  });
