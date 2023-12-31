"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { createColumnHelper } from "@tanstack/react-table";
import { useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import Image from "next/image";
import { playerQueue } from "../_state/playback";
import { PlayableTrack } from "../_types/track";
import { DebugTableRow } from "./debug-table-row";
import { ExpandableTable } from "./expandable-table";
import { QueueState } from "../_types/queue";

interface Props {
  serverQueue: QueueState;
}
const iconHeight = 24;
const trackColumnHelper = createColumnHelper<PlayableTrack>();
const trackColumns = [
  trackColumnHelper.display({
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          onClick={row.getToggleExpandedHandler()}
          className="cursor-pointer block"
        >
          {row.getIsExpanded() ? (
            <MinusIcon className="hover:text-green-600" height={iconHeight} />
          ) : (
            <PlusIcon className="hover:text-green-600" height={iconHeight} />
          )}
        </button>
      ) : (
        "🔵"
      ),
    header: () => null,
    size: iconHeight,
    id: "expander",
    meta: {isBorderless: true}
  }),
  trackColumnHelper.accessor("uri", {}),
  trackColumnHelper.accessor("imageUrl", {
    header: () => null,
    cell: ({ getValue }) => (
      <Image alt="track_art" src={getValue()} width={50} height={50} />
    ),
    size: 56,
    meta: {isBorderless: true}
  }),
  trackColumnHelper.accessor("name", {
    header: () => <span>Name</span>,
    size: 250,
  }),
  trackColumnHelper.accessor("creators", {
    header: () => <span>Artists</span>,
    cell: ({ getValue }) =>
      getValue()
        ?.map((c) => c.name)
        ?.join(", ") ?? "Unknown",
    size: 250,
  }),
  trackColumnHelper.accessor("collection", {
    header: () => <span>Album</span>,
    cell: ({ getValue }) => getValue()?.name ?? "Unknown",
    size: 250,
  }),
  trackColumnHelper.accessor("duration", {
    header: () => <span>Duration</span>,
    size: 75,
    cell: (info) => <div className="text-right">{info.getValue()}</div>,
  }),
];
export const PlayerQueue = ({ serverQueue }: Props) => {
  // keeping this up to date is going to require some coordination with the player component
  useHydrateAtoms([[playerQueue, serverQueue]]);
  const queue = useAtomValue(playerQueue);
  return (
    <>
      <h2 className="text-xl">Queue</h2>
      {queue.context? <p>Playing from {queue.context.name}</p>: null}
      <ExpandableTable
        data={queue.items}
        columns={trackColumns}
        state={{ columnVisibility: { uri: false } }}
        renderSubComponent={DebugTableRow}
        getRowCanExpand={() => true}
      />
    </>
  );
};
