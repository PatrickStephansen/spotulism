import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { AccessToken } from "@spotify/web-api-ts-sdk/dist/mjs/types";

export const getSpotifySdk = (userToken: AccessToken) =>
  SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID ?? "", userToken, {
    fetch,
  });
