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
const albumColumnHelper = createColumnHelper<SearchMatch["albums"][0]>();
const playlistColumnHelper = createColumnHelper<SearchMatch["playlists"][0]>();
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
          width={50}
          height={50}
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
  trackColumnHelper.accessor("popularityScore", {
    header: () => <span>Popularity</span>,
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
  artistColumnHelper.accessor((row) => row.previewImageUrl, {
    header: () => null,
    id: "artistImage",
    cell: (info) => (
      <Image alt="artist_image" src={info.getValue()} width={50} height={50} />
    ),
  }),
  artistColumnHelper.accessor("name", {
    header: () => <span>Name</span>,
  }),
  artistColumnHelper.accessor("followersCount", {
    header: () => <span>Followers</span>,
  }),
  artistColumnHelper.accessor("popularityScore", {
    header: () => <span>Popularity</span>,
  }),
  artistColumnHelper.accessor((row) => row.genres?.join(", ") ?? "", {
    id: "genres",
    header: () => <span>Genres</span>,
  }),
];

const albumColumns = [
  albumColumnHelper.display({
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
  albumColumnHelper.accessor((row) => row.previewImageUrl, {
    id: "albumArt",
    header: () => null,
    cell: (info) => (
      <Image alt="album_image" src={info.getValue()} width={50} height={50} />
    ),
  }),
  albumColumnHelper.accessor("name", {
    header: () => <span>Name</span>,
  }),
  albumColumnHelper.accessor(
    (row) => row.artists?.map((a) => a.name)?.join(", "),
    {
      header: () => <span>Artists</span>,
      id: "artists",
    }
  ),
  albumColumnHelper.accessor("popularityScore", {
    header: () => <span>Popularity</span>,
  }),
  albumColumnHelper.accessor("releaseDate", {
    header: () => <span>Release Date</span>,
  }),
  albumColumnHelper.accessor("type", {
    header: () => <span>Release Type</span>,
  }),
  albumColumnHelper.accessor("tracksCount", {
    header: () => <span># tracks</span>,
  }),
];

const playlistColumns = [
  playlistColumnHelper.display({
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
  albumColumnHelper.accessor((row) => row.previewImageUrl, {
    id: "playlistArt",
    header: () => null,
    cell: (info) => (
      <Image alt="playlist_image" src={info.getValue()} width={50} height={50} />
    ),
  }),
  playlistColumnHelper.accessor("name", {
    header: () => <span>Name</span>,
  }),
  playlistColumnHelper.accessor("description", {
    header: () => <span className="text-ellipsis max-w-30">Description</span>,
    cell: (info)=><span title={info.getValue()}>{info.getValue()}</span>
  }),
  playlistColumnHelper.accessor((row) => row.creator.name, {
    header: () => <span>Creator</span>,
    id: "creatorName",
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
      {searchResults.isSearching ? (
        <div>Loading...</div>
      ) : !searchResults.isSearchComplete ? null : (
        <>
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
          <h3 className="text-lg m-2" key="albums-header">
            Albums
          </h3>
          <ExpandableTable
            key="albums-table"
            data={searchResults.albums}
            columns={albumColumns}
            getRowCanExpand={() => true}
            renderSubComponent={DebugTableRow}
          />
          <h3 className="text-lg m-2" key="playlists-header">
            Playlists
          </h3>
          <ExpandableTable
            key="playlists-table"
            data={searchResults.playlists}
            columns={playlistColumns}
            getRowCanExpand={() => true}
            renderSubComponent={DebugTableRow}
          />
        </>
      )}
    </>
  );
};
