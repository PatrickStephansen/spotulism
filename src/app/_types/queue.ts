import { PlayableTrack } from "./track";

export interface PlaybackContext {
  type: "artist" | "playlist" | "album" | "show";
  uri: string;
  name: string;
}

export interface QueueState {
  items: PlayableTrack[];
  context?: PlaybackContext;
}
