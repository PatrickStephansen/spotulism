"use client";

import { useAtom, useAtomValue } from "jotai";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useState,
  MouseEvent,
} from "react";
import {
  PlayIcon,
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
} from "@heroicons/react/20/solid";
import { userHasLoggedIn } from "../_state/user-has-logged-in";
import Script from "next/script";
import Image from "next/image";
import { TrackWithAlbum } from "@spotify/web-api-ts-sdk/dist/mjs/types";
import { msToDisplayDuration } from "../_lib/unit-conversion";
import { updateQueueFromServer } from "../_state/playback";
import { Slider } from "./slider";

const iconHeight = 18;

const getCookie = (name: string) =>
  decodeURIComponent(
    document.cookie.match(`(?<=;?\s*${name}=)[^;]+`)?.[0] ?? "{}"
  );

export const Player = () => {
  const userIsLoggedIn = useAtomValue(userHasLoggedIn);
  const [_, updateQueue] = useAtom(updateQueueFromServer);
  const [devices, setDevices] = useState<any[]>([]);
  const [thisDeviceId, setThisDeviceId] = useState<string>();
  const [activeDevice, setActiveDevice] = useState<string>();
  const [activeDeviceQuery, setActiveDeviceQuery] = useState(
    new AbortController()
  );
  const [playState, setPlayState] = useState<"pause" | "play">("pause");
  // from spotify's example at https://github.com/spotify/spotify-web-playback-sdk-example/blob/main/src/WebPlayback.jsx
  const [player, setPlayer] = useState();
  const [playerState, setPlayerState] = useState();
  const [current_track, setTrack] = useState<TrackWithAlbum>();
  const [targetMs, setTargetMs] = useState<number>();
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
        setThisDeviceId(device_id);
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
        setPlayerState(state);
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
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const state = await player?.getCurrentState();
      if (state) {
        setPlayerState(state);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [player]);

  useEffect(() => {
    // wait a bit because the player needs to confirm with the server that it's started the next track
    // that is not an event we can hook into directly
    setTimeout(() => {
      updateQueue();
    }, 3000);
  }, [current_track?.uri]);

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
              updateQueue();
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

  const trackText =
    `${current_track?.name ?? "unknown track"} by 
  ${current_track?.artists?.map((a) => a.name)?.join(", ")}` ??
    "unknown artist";
  const onSeek = useCallback(
    (value: number) => {
      player.seek(value);
      setTargetMs(undefined);
    },
    [player, setTargetMs]
  );
  const onSeekPreview = useCallback(
    (value: number): void => setTargetMs(value),
    [setTargetMs]
  );
  return (
    <div className="fixed bottom-0 right-3 bg-slate-900">
      <div className="flex justify-between items-center my-2">
        <label htmlFor="playback-device-select" className="mx-2">
          Playback device
        </label>
        <select
          name="playbackDevice"
          id="playback-device-select"
          className="bg-black rounded border p-2"
          value={activeDevice}
          onChange={onDeviceChange}
        >
          <option key="default" value="">
            Select device
          </option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      {!activeDevice || activeDevice !== thisDeviceId ? null : (
        <div className="flex flex-col items-center">
          {current_track?.album?.images?.[0]?.url && (
            <Image
              key="playingTrackArt"
              alt="album_art"
              src={current_track?.album?.images?.[0]?.url}
              width={300}
              height={300}
            />
          )}
          <p className="max-w-xs truncate" title={trackText}>
            {trackText}
          </p>
          <Slider
            min={0}
            max={playerState?.duration ?? 1}
            value={playerState?.position}
            className="w-[300px] mb-2"
            onChange={onSeek}
            onDrag={onSeekPreview}
          />
          <div className="flex justify-evenly items-center gap-2">
            <p className="font-mono">
              {msToDisplayDuration(targetMs ?? playerState?.position)}
            </p>
            <div className="">
              <button
                className="p-2 border rounded"
                title="Previous track"
                onClick={() => {
                  player?.previousTrack();
                }}
              >
                <BackwardIcon height={iconHeight} />
              </button>
              <button
                type="button"
                className="p-2 border rounded"
                title={playState === "pause" ? "Play" : "Pause"}
                onClick={() => player?.togglePlay()}
              >
                {playState === "pause" ? (
                  <PlayIcon height={iconHeight} />
                ) : (
                  <PauseIcon height={iconHeight} />
                )}
              </button>
              <button
                className="p-2 border rounded"
                title="Next track"
                onClick={() => {
                  player?.nextTrack();
                }}
              >
                <ForwardIcon height={iconHeight} />
              </button>
            </div>
            <p className="font-mono">
              {msToDisplayDuration(playerState?.duration)}
            </p>
          </div>
        </div>
      )}
      <Script src="https://sdk.scdn.co/spotify-player.js" async={true} />
    </div>
  );
};
