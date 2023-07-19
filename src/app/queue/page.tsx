import { PlayerQueue } from "../_components/player-queue";
import { getQueueState } from "../_lib/queue";

export default async function Queue() {
  const queue = await getQueueState();
  return (
    <>
      <PlayerQueue serverQueue={queue} />
    </>
  );
}
