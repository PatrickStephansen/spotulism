import { QueueState } from "../_types/queue";
import { PlayableTrack, trackOrEpisodeToPlayableTrack } from "../_types/track";
import { getSpotifySdk, getSpotifyUserTokenCookie } from "./spotify-sdk";

export const getQueueState = async (): Promise<QueueState> => {
  const sdk = getSpotifySdk(getSpotifyUserTokenCookie());
  const queue = await sdk.player.getUsersQueue();
  const items: PlayableTrack[] = queue.currently_playing
    ? [
        trackOrEpisodeToPlayableTrack(queue.currently_playing),
        ...queue.queue.map(trackOrEpisodeToPlayableTrack),
      ]
    : [];
  const context = await sdk.player
    .getPlaybackState()
    .then((state) => state?.context);
  if (!context) {
    return { items };
  }
  const contextId = context.uri.split(":").at(-1);
  const name =
    context.type === "album"
      ? await sdk.albums
          .get(contextId)
          .then(
            (album) =>
              `${album.name} by ${album.artists
                .map((artist) => artist.name)
                .join(", ")}`
          )
      : context.type === "playlist"
      ? await sdk.playlists
          .getPlaylist(contextId)
          .then((playlist) => `${playlist.name} by ${playlist.owner.display_name}`)
      : context.type === "artist"
      ? await sdk.artists.get(contextId).then((artist) => artist.name)
      : context.type === "show"
      ? // market parameter here is overridden by user token, but typing is inconsistent here so it seems required
        await sdk.shows
          .get(contextId, "ZA")
          .then((show) => `${show.name} by ${show.publisher}`)
      : `unknown context type: ${context.type}`;

  return { items, context: { uri: context.uri, name, type: context.type } };
};
