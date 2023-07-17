import { PlayerQueue } from "../_components/player-queue";
import { getSpotifySdk, getSpotifyUserTokenCookie } from "../_lib/spotify-sdk";
import { trackOrEpisodeToPlayableTrack } from "../_types/track";

export default async function Queue() {
  const sdk = getSpotifySdk(getSpotifyUserTokenCookie());
  const queue = await sdk.player.getUsersQueue();
  const items = queue.currently_playing
    ? [
        trackOrEpisodeToPlayableTrack(queue.currently_playing),
        queue.queue.map(trackOrEpisodeToPlayableTrack),
      ]
    : [];
  console.log("rendering queue", items);
  return (
    <>
      <PlayerQueue serverQueue={items} limitItems={0} />
    </>
  );
}
