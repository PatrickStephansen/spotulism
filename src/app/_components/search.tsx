"use client";

import { ChangeEvent } from "react";
import { doSearch, searchMatches } from "../_state/current-search";
import { useAtom, useAtomValue } from "jotai";
import Image from "next/image";
import { SearchMatch } from "../_types/search";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface Props {}

const trackColumnHelper = createColumnHelper<SearchMatch["tracks"][0]>();
const trackColumns = [
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
      <div className="p-2">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <pre>{JSON.stringify(searchResults, null, 2)}</pre>
    </>
  );
};
