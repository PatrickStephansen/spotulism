"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { useAtom, useAtomValue } from "jotai";
import Image from "next/image";
import { ChangeEvent } from "react";
import { doSearch, searchMatches } from "../_state/current-search";
import { SearchMatch } from "../_types/search";
import { DebugTableRow } from "./debug-table-row";
import { ExpandableTable } from "./expandable-table";

interface Props {}

const trackColumnHelper = createColumnHelper<SearchMatch["tracks"][0]>();
const artistColumnHelper = createColumnHelper<SearchMatch["artists"][0]>();
const trackColumns = [
  trackColumnHelper.display({
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          onClick={row.getToggleExpandedHandler()}
          className="cursor-pointer"
        >
          {row.getIsExpanded() ? "👇" : "👉"}
        </button>
      ) : (
        "🔵"
      ),
    header: () => null,
    id: "expander",
  }),
  trackColumnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    header: () => <span>Name</span>,
  }),
  trackColumnHelper.accessor(
    (row) => row.artists.map((a: any) => a.name).join(", "),
    {
      id: "artists",
      cell: (info) => info.getValue(),
      header: () => <span>Artists</span>,
    }
  ),
  trackColumnHelper.accessor((row) => row.album, {
    id: "album",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Image
          alt="album art"
          width={30}
          height={30}
          src={info.getValue()?.previewImageUrl}
        />
        {info.getValue()?.name}
      </div>
    ),
    header: () => <span>Album</span>,
  }),
  trackColumnHelper.accessor(
    (row) => row.album?.releaseDate ?? "unknown release date",
    {
      id: "releaseDate",
      cell: (info) => info.getValue(),
      header: () => <span>Release Date</span>,
    }
  ),
  trackColumnHelper.accessor("duration", {
    header: () => <span>Duration</span>,
  }),
];

const artistColumns = [
  artistColumnHelper.display({
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          onClick={row.getToggleExpandedHandler()}
          className="cursor-pointer"
        >
          {row.getIsExpanded() ? "👇" : "👉"}
        </button>
      ) : (
        "🔵"
      ),
    header: () => null,
    id: "expander",
  }),
  artistColumnHelper.accessor("name", {
    header: () => <span>Name</span>
  }),
];

export const Search = ({}: Props) => {
  const [searchParams, setSearchParams] = useAtom(doSearch);
  const searchResults = useAtomValue(searchMatches);

  const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ types: searchParams.types, term: e.target.value });
  };

  return (
    <>
      <label htmlFor="general-search" className="mr-2">
        Search
      </label>
      <input
        id="general-search"
        type="text"
        className="rounded border p-2 bg-slate-900"
        onChange={handleSearchInput}
        value={searchParams.term}
      />
      <h2 className="text-xl m-2">Results</h2>
      <h3 className="text-lg m-2" key="tracks-header">
        Tracks
      </h3>
      <ExpandableTable
        key="tracks-table"
        data={searchResults.tracks}
        columns={trackColumns}
        getRowCanExpand={() => true}
        renderSubComponent={DebugTableRow}
      />
      <h3 className="text-lg m-2" key="artists-header">
        Artists
      </h3>
      <ExpandableTable
        key="artists-table"
        data={searchResults.artists}
        columns={artistColumns}
        getRowCanExpand={() => true}
        renderSubComponent={DebugTableRow}
      />
    </>
  );
};
