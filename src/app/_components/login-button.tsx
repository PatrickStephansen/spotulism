"use client";

import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { userHasLoggedIn } from "../_state/user-has-logged-in";
import { userProfile } from "../_state/user-profile";

export const LoginButton = () => {
  const [isLoggedIn, setLoggedIn] = useAtom(userHasLoggedIn);
  const setProfile = useSetAtom(userProfile);
  const login = useCallback(() => {
    SpotifyApi.performUserAuthorization(
      process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "",
      process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL ?? "/",
      process.env.NEXT_PUBLIC_SPOTIFY_SCOPES?.split(" ") || ["streaming"],
      async (token) => {
        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_LOGIN_CALLBACK_URL ?? "/",
            { body: JSON.stringify(token), method: "POST" }
          );
          const userProfile = await response.json();
          setProfile(userProfile);
          setLoggedIn(true);
        } catch (error) {
          setLoggedIn(false);
          setProfile(undefined);
        }
      },
      { fetch }
    );
  }, []);
  useEffect(() => {
    // This could go badly if there's more than one of this component on the page
    if (!isLoggedIn && window.localStorage.getItem("spotify-sdk:verifier")) {
      login();
    }
  }, [isLoggedIn, setLoggedIn]);

  return (
    <button type="button" className="border rounded p-2" onClick={login}>
      Login
    </button>
  );
};
