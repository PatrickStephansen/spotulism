"use client";

import { ChangeEvent } from "react";
import { doSearch, searchMatches } from "../_state/current-search";
import { useAtom, useAtomValue } from "jotai";
import Image from "next/image";
import { SearchMatch } from "../_types/search";
import {
  ColumnDef,
  Row,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ExpandableTable } from "./expandable-table";

interface Props {}

const trackColumnHelper = createColumnHelper<SearchMatch["tracks"][0]>();
const trackColumns = [
  {
    header: () => null,
    id: 'expander',
    cell: ({row}:{row:any}) => row.getCanExpand() ? (
      <button
        {...{
          onClick: row.getToggleExpandedHandler(),
          className:"cursor-pointer"
        }}
      >
        {row.getIsExpanded() ? '👇' : '👉'}
      </button>
    ) : (
      '🔵'
    )
  },
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
      <div className="flex items-center">
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

const renderSubComponent = ({ row }: { row: Row<SearchMatch["tracks"][0]> }) => {
  return (
    <pre style={{ fontSize: '10px' }}>
      <code>{JSON.stringify(row.original, null, 2)}</code>
    </pre>
  )
}

export const Search = ({}: Props) => {
  const [searchParams, setSearchParams] = useAtom(doSearch);
  const searchResults = useAtomValue(searchMatches);

  const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ types: searchParams.types, term: e.target.value });
  };
  const table = useReactTable({
    data: searchResults.tracks,
    columns: trackColumns,
    getCoreRowModel: getCoreRowModel(),
  });

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
      <h3 className="text-lg m-2">Tracks</h3>
      <ExpandableTable data={searchResults.tracks} columns={trackColumns} getRowCanExpand={() => true} renderSubComponent={renderSubComponent}/>
      <pre>{JSON.stringify(searchResults, null, 2)}</pre>
    </>
  );
};
