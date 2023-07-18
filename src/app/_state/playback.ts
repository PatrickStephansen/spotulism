import { atom } from "jotai";
import { PlayableTrack } from "../_types/track";

export const playerQueue = atom<PlayableTrack[]>([]);

export const updateQueueFromServer = atom(null, async (_get, set) => {
  const response = await fetch("/api/playback/queue");
  if (response.ok) {
    const queueItems = await response.json();
    set(playerQueue, queueItems);
  }
});
