import { Artist } from "@spotify/web-api-ts-sdk/dist/mjs/types";
import { msToDisplayDuration } from "../_lib/unit-conversion";

// abstracts over Spotify tracks and episodes used in queue
export interface PlayableTrack {
  uri: string;
  name: string;
  imageUrl: string;
  duration: string;
  creators: [{ name: string; uri?: string }];
  collection: { name: string; uri: string };
}

interface MediaImage {
  height?: number;
  width?: number;
  url: string;
}

const getLargestImage = (images: MediaImage[]) =>
  images.reduce(
    (current, largest) =>
      (current?.height ?? 0) * (current?.width ?? 0) >=
      (largest?.height ?? 0) * (largest?.width ?? 0)
        ? current
        : largest,
    { height: 0, width: 0, url: "/default-album.png" } as MediaImage
  );

export const trackOrEpisodeToPlayableTrack = (item: any): PlayableTrack => ({
  uri: item.uri,
  name: item.name,
  duration: msToDisplayDuration(item.duration_ms),
  imageUrl: getLargestImage(item?.images ?? item?.album?.images ?? []).url,
  creators: item.artists?.map((a: Artist) => ({
    name: a.name,
    uri: a.uri,
  })) ?? [{ name: item.show.publisher }],
  collection: item.album
    ? { name: item.album.name, uri: item.album.uri }
    : { name: item.show.name, uri: item.show.uri },
});
