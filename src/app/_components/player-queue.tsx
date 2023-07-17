"use client";

import { Row, createColumnHelper } from "@tanstack/react-table";
import { PlayableTrack } from "../_types/track";
import { JSXElementConstructor, ReactElement, useState } from "react";
import Image from "next/image";
import { msToDisplayDuration } from "../_lib/unit-conversion";
import { ExpandableTable } from "./expandable-table";
import { DebugTableRow } from "./debug-table-row";

interface Props {
  serverQueue: PlayableTrack[];
  limitItems: number;
}
const trackColumnHelper = createColumnHelper<PlayableTrack>();
const trackColumns = [
  trackColumnHelper.accessor("uri", {}),
  trackColumnHelper.accessor("imageUrl", {
    header: () => null,
    cell: ({ getValue }) => (
      <Image alt="track_art" src={getValue()} width={100} height={100} />
    ),
  }),
  trackColumnHelper.accessor("name", { header: () => <span>Name</span> }),
  trackColumnHelper.accessor("durationMs", {
    header: () => <span>Duration</span>,
    cell: ({ getValue }) => <span>{msToDisplayDuration(getValue())}</span>,
  }),
  trackColumnHelper.accessor((info) => info.creators, {
    header: () => <span>Artists</span>,
    cell: ({ getValue }) =>
      getValue()
        .map((c) => c.name)
        .join(", "),
    id: "creators",
  }),
  trackColumnHelper.accessor("collection", {
    header: () => <span>Album</span>,
    cell: ({ getValue }) => getValue().name,
  }),
];
export const PlayerQueue = ({ serverQueue, limitItems }: Props) => {
  // keeping this up to date is going to require some coordination with the player component
  const [queue, setQueue] = useState(serverQueue);
  return (
    <>
      <h2 className="text-xl">Queue</h2>
      <ExpandableTable
        data={queue}
        columns={trackColumns}
        renderSubComponent={DebugTableRow}
        getRowCanExpand={() => true}
      />
    </>
  );
};
