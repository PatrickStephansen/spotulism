import { atom } from "jotai";
import { QueueState } from "../_types/queue";

export const playerQueue = atom<QueueState>({items:[]});

export const updateQueueFromServer = atom(null, async (_get, set) => {
  const response = await fetch("/api/playback/queue");
  if (response.ok) {
    const queueState = await response.json();
    set(playerQueue, queueState);
  }
});
