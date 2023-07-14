"use client";

import { useAtomValue } from "jotai";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { userHasLoggedIn } from "../_state/user-has-logged-in";
import Script from "next/script";
import Image from "next/image";

const track = {
  name: "",
  album: {
    images: [{ url: "" }],
  },
  artists: [{ name: "" }],
};

const getCookie = (name: string) =>
  decodeURIComponent(
    document.cookie.match(`(?<=;?\s*${name}=)[^;]+`)?.[0] ?? "{}"
  );

export const Player = () => {
  const userIsLoggedIn = useAtomValue(userHasLoggedIn);
  const [devices, setDevices] = useState<any[]>([]);
  const [thisDeviceId, setThisDeviceId] = useState<string>();
  const [activeDevice, setActiveDevice] = useState<string>();
  const [activeDeviceQuery, setActiveDeviceQuery] = useState(
    new AbortController()
  );
  const [playState, setPlayState] = useState<"pause" | "play">("pause");
  // from spotify's example at https://github.com/spotify/spotify-web-playback-sdk-example/blob/main/src/WebPlayback.jsx
  const [player, setPlayer] = useState(undefined);
  const [current_track, setTrack] = useState(track);
  const [currentTrackProgress, setCurrentTrackProgress] = useState(0);
  useEffect(() => {
    if (!userIsLoggedIn) return;
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Spotulism",
        getOAuthToken: (cb) =>
          cb(JSON.parse(getCookie("SPOTIFY_USER_TOKEN")).access_token),
        volume: 0.5,
      });

      setPlayer(player);
      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setThisDeviceId(device_id)
        setDevices((d) => [...d, { id: device_id, name: "Spotulism" }]);
      });
      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
        setDevices((d) => d.filter((device) => device.id !== device_id));
      });
      player.addListener("player_state_changed", (state) => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPlayState(state.paused ? "pause" : "play");
        setCurrentTrackProgress(state.position / state.duration);
      });

      player.connect();
    };
  }, [userIsLoggedIn]);
  useEffect(() => {
    if (userIsLoggedIn) {
      fetch("/api/playback/devices")
        .then((r) => r.json())
        .then((d) => {
          setDevices(d);
          const active = d.find((device) => device.is_active);
          if (active) {
            setActiveDevice(active.id);
          }
        });
    }
  }, [setDevices, setActiveDevice, userIsLoggedIn, player]);
  const sendDeviceTransferRequest = useCallback(
    (newDevice: string | undefined, play: boolean) => {
      if (newDevice) {
        activeDeviceQuery.abort("new query in progress");
        const newAbortController = new AbortController();
        setActiveDeviceQuery(newAbortController);
        return fetch("/api/playback/devices/active", {
          method: "PUT",
          signal: newAbortController.signal,
          body: JSON.stringify({ shouldPlay: play, activeDeviceId: newDevice }),
        })
          .then((r) => {
            if (r.ok) {
              setActiveDevice(newDevice);
              setPlayState(play ? "play" : "pause");
            }
          })
          .catch((reason) => {
            if (reason !== "new query in progress") throw reason;
          });
      }
    },
    [devices, setActiveDevice, setActiveDeviceQuery, setPlayState]
  );
  const onDeviceChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const newDevice = event.target.value;

      sendDeviceTransferRequest(newDevice, true);
    },
    [sendDeviceTransferRequest]
  );
  const onPlayButton = useCallback(() => {
    sendDeviceTransferRequest(activeDevice, playState === "pause");
  }, [sendDeviceTransferRequest, playState, activeDevice]);
  return (
    <div className="fixed bottom-0 bg-slate-900 w-100vw">
      <label htmlFor="playback-device-select" className="mx-2">
        Playback device
      </label>
      <select
        name="playbackDevice"
        id="playback-device-select"
        className="bg-black round border p-2"
        value={activeDevice}
        onChange={onDeviceChange}
        defaultValue={""}
      >
        <option key="default" value="" disabled>
          None active
        </option>
        {devices.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      {activeDevice !== thisDeviceId ? null : (
        <div>
          {current_track?.album?.images?.[0]?.url && (
            <Image
              key="playingTrackArt"
              alt="album_art"
              src={current_track?.album?.images?.[0]?.url}
              height={250}
              width={250}
            />
          )}
          <div>
            Now playing: {current_track?.name ?? "unknown track"} by{" "}
            {current_track?.artists?.map((a) => a.name)?.join(", ") ??
              "unknown artist"}
          </div>
          <div className="bg-black w-100 h-5">
            <div
              className="bg-green-600 h-5"
              style={{ width: currentTrackProgress * 100 + "%" }}
            ></div>
          </div>
          <button
            className="btn-spotify"
            onClick={() => {
              player?.previousTrack();
            }}
          >
            &lt;&lt;
          </button>
          <button
            type="button"
            className="p-2 border"
            onClick={() => player?.togglePlay()}
          >
            {playState === "pause" ? "|>" : "||"}
          </button>
          <button
            className="btn-spotify"
            onClick={() => {
              player?.nextTrack();
            }}
          >
            &gt;&gt;
          </button>
        </div>
      )}
      <Script src="https://sdk.scdn.co/spotify-player.js" async={true} />
    </div>
  );
};
