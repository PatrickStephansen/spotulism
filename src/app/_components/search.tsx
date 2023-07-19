"use client";

import { createColumnHelper } from "@tanstack/react-table";
import {
  PlayIcon,
  PlusIcon,
  MinusIcon,
  BarsArrowDownIcon,
} from "@heroicons/react/24/solid";
import { useAtom, useAtomValue } from "jotai";
import Image from "next/image";
import { ChangeEvent, useMemo } from "react";
import { doSearch, searchMatches } from "../_state/current-search";
import { SearchMatch } from "../_types/search";
import { DebugTableRow } from "./debug-table-row";
import { ExpandableTable } from "./expandable-table";
import { QueueState } from "../_types/queue";
import { playerQueue } from "../_state/playback";

interface Props {}

const iconHeight = 24;
const playMedia = (uri: string) => {
  fetch("/api/playback/context", {
    method: "PUT",
    body: JSON.stringify({ contextUri: uri }),
  });
};

const enqueueMedia = (uri: string, setQueue: (queue: QueueState) => void) => {
  fetch("/api/playback/queue", {
    method: "POST",
    body: JSON.stringify({ uri }),
  })
    .then(async (res) => {
      if (!res.ok) {
        throw await res.json();
      }
      return res.json();
    })
    .then((updatedQueue) => setQueue(updatedQueue));
};

const trackColumnHelper = createColumnHelper<SearchMatch["tracks"][0]>();
const artistColumnHelper = createColumnHelper<SearchMatch["artists"][0]>();
const albumColumnHelper = createColumnHelper<SearchMatch["albums"][0]>();
const playlistColumnHelper = createColumnHelper<SearchMatch["playlists"][0]>();

const artistColumns = [
  artistColumnHelper.display({
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
    meta: { title: "Expand details" },
  }),
  artistColumnHelper.accessor("uri", {
    cell: ({ getValue }) => (
      <button
        className="block"
        type="button"
        onClick={() => playMedia(getValue())}
      >
        <PlayIcon className="hover:text-green-600" height={iconHeight} />
      </button>
    ),
    header: () => null,
    size: iconHeight,
    id: "play",
    meta: { title: "Play immediately, discarding your queue" },
  }),
  artistColumnHelper.accessor((row) => row.previewImage, {
    header: () => null,
    id: "artistImage",
    size: 56,
    cell: (info) => (
      <Image
        alt="artist_image"
        src={info.getValue()?.url ?? "/default-profile.png"}
        width={info.getValue()?.width ?? 50}
        height={info.getValue()?.height ?? 50}
      />
    ),
  }),
  artistColumnHelper.accessor("name", {
    header: () => <span>Name</span>,
    size: 250,
  }),
  artistColumnHelper.accessor("followersCount", {
    header: () => <span>Followers</span>,
    size: 75,
    cell: (info) => (
      <div className="text-right">{info.getValue()?.toLocaleString()}</div>
    ),
  }),
  artistColumnHelper.accessor("popularityScore", {
    header: () => <span>Popularity</span>,
    size: 75,
    cell: (info) => <div className="text-right">{info.getValue()}</div>,
  }),
  artistColumnHelper.accessor((row) => row.genres?.join(", ") ?? "", {
    id: "genres",
    header: () => <span>Genres</span>,
    size: 250,
  }),
];

const albumColumns = [
  albumColumnHelper.display({
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
    meta: { title: "Expand details" },
  }),
  albumColumnHelper.accessor("uri", {
    cell: ({ getValue }) => (
      <button
        className="block"
        type="button"
        onClick={() => playMedia(getValue())}
      >
        <PlayIcon className="hover:text-green-600" height={iconHeight} />
      </button>
    ),
    header: () => null,
    size: iconHeight,
    id: "play",
    meta: { title: "Play immediately, discarding your queue" },
  }),
  albumColumnHelper.accessor((row) => row.previewImage, {
    id: "albumArt",
    header: () => null,
    size: 56,
    cell: (info) => (
      <Image
        alt="album_image"
        src={info.getValue()?.url ?? "/default-album.png"}
        width={info.getValue()?.width ?? 50}
        height={info.getValue()?.height ?? 50}
      />
    ),
  }),
  albumColumnHelper.accessor("name", {
    header: () => <span>Name</span>,
    size: 250,
  }),
  albumColumnHelper.accessor(
    (row) => row.artists?.map((a) => a.name)?.join(", "),
    {
      header: () => <span>Artists</span>,
      id: "artists",
      size: 250,
    }
  ),
  albumColumnHelper.accessor("popularityScore", {
    header: () => <span>Popularity</span>,
    size: 75,
    cell: (info) => <div className="text-right">{info.getValue()}</div>,
  }),
  albumColumnHelper.accessor("releaseDate", {
    header: () => <span>Release Date</span>,
    size: 75,
  }),
  albumColumnHelper.accessor("type", {
    header: () => <span>Release Type</span>,
    size: 75,
  }),
  albumColumnHelper.accessor("tracksCount", {
    header: () => <span># tracks</span>,
    size: 50,
    cell: (info) => <div className="text-right">{info.getValue()}</div>,
  }),
];

const playlistColumns = [
  playlistColumnHelper.display({
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
    meta: { title: "Expand details" },
  }),
  playlistColumnHelper.accessor("uri", {
    cell: ({ getValue }) => (
      <button
        className="block"
        type="button"
        onClick={() => playMedia(getValue())}
      >
        <PlayIcon className="hover:text-green-600" height={iconHeight} />
      </button>
    ),
    header: () => null,
    size: iconHeight,
    id: "play",
    meta: { title: "Play immediately, discarding your queue" },
  }),
  albumColumnHelper.accessor((row) => row.previewImage, {
    id: "playlistArt",
    header: () => null,
    size: 56,
    cell: (info) => (
      <Image
        alt="playlist_image"
        src={info.getValue()?.url}
        width={info.getValue()?.width ?? 50}
        height={info.getValue()?.height ?? 50}
      />
    ),
  }),
  playlistColumnHelper.accessor("name", {
    header: () => <span>Name</span>,
    size: 250,
  }),
  playlistColumnHelper.accessor("description", {
    header: () => <span className="text-ellipsis max-w-30">Description</span>,
    cell: (info) => <span title={info.getValue()}>{info.getValue()}</span>,
    size: 250,
  }),
  playlistColumnHelper.accessor((row) => row.creator.name, {
    header: () => <span>Creator</span>,
    id: "creatorName",
    size: 250,
  }),
  playlistColumnHelper.accessor("followersCount", {
    header: () => <span>Followers</span>,
    size: 75,
    cell: (info) => (
      <div className="text-right">{info.getValue()?.toLocaleString()}</div>
    ),
  }),
];

export const Search = ({}: Props) => {
  const [searchParams, setSearchParams] = useAtom(doSearch);
  const searchResults = useAtomValue(searchMatches);
  const [queue, setQueue] = useAtom(playerQueue);

  const trackColumns = useMemo(
    () => [
      trackColumnHelper.display({
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="cursor-pointer block"
            >
              {row.getIsExpanded() ? (
                <MinusIcon
                  className="hover:text-green-600"
                  height={iconHeight}
                />
              ) : (
                <PlusIcon
                  className="hover:text-green-600"
                  height={iconHeight}
                />
              )}
            </button>
          ) : (
            "🔵"
          ),
        header: () => null,
        size: iconHeight,
        id: "expander",
        meta: { title: "Expand details" },
      }),
      trackColumnHelper.accessor("uri", {
        cell: ({ getValue }) => (
          <button
            className="block"
            type="button"
            onClick={() => playMedia(getValue())}
          >
            <PlayIcon className="hover:text-green-600" height={iconHeight} />
          </button>
        ),
        header: () => null,
        size: iconHeight,
        id: "play",
        meta: { title: "Play immediately, discarding your queue" },
      }),
      trackColumnHelper.accessor("uri", {
        cell: ({ getValue }) => (
          <button
            className="block"
            type="button"
            onClick={() => enqueueMedia(getValue(), setQueue)}
          >
            <BarsArrowDownIcon
              className="hover:text-green-600"
              height={iconHeight}
            />
          </button>
        ),
        header: () => null,
        size: iconHeight,
        id: "enqueue",
        meta: { title: "Add to queue" },
      }),
      trackColumnHelper.accessor("name", {
        cell: (info) => info.getValue(),
        header: () => <span>Name</span>,
        size: 250,
      }),
      trackColumnHelper.accessor(
        (row) => row.artists.map((a: any) => a.name).join(", "),
        {
          id: "artists",
          cell: (info) => info.getValue(),
          header: () => <span>Artists</span>,
          size: 250,
        }
      ),
      trackColumnHelper.accessor((row) => row.album?.previewImage, {
        header: () => null,
        id: "trackImage",
        size: 56,
        cell: (info) => (
          <Image
            alt="track_image"
            src={info.getValue()?.url ?? "/default-album.png"}
            width={info.getValue()?.width ?? 50}
            height={info.getValue()?.height ?? 50}
          />
        ),
      }),
      trackColumnHelper.accessor((row) => row.album.name, {
        id: "album",
        cell: (info) => info.getValue(),
        header: () => <span>Album</span>,
        size: 250,
      }),
      trackColumnHelper.accessor(
        (row) => row.album?.releaseDate ?? "unknown release date",
        {
          id: "releaseDate",
          cell: (info) => info.getValue(),
          header: () => <span>Release Date</span>,
          size: 100,
        }
      ),
      trackColumnHelper.accessor("duration", {
        header: () => <span>Duration</span>,
        size: 75,
        cell: (info) => <div className="text-right">{info.getValue()}</div>,
      }),
      trackColumnHelper.accessor("popularityScore", {
        header: () => <span>Popularity</span>,
        size: 75,
        cell: (info) => <div className="text-right">{info.getValue()}</div>,
      }),
    ],
    [setQueue]
  );

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
          <h2 className="text-xl">Results</h2>
          <h3 className="text-lg" key="tracks-header">
            Tracks
          </h3>
          <ExpandableTable
            key="tracks-table"
            data={searchResults.tracks}
            columns={trackColumns}
            getRowCanExpand={() => true}
            renderSubComponent={DebugTableRow}
          />
          <h3 className="text-lg" key="artists-header">
            Artists
          </h3>
          <ExpandableTable
            key="artists-table"
            data={searchResults.artists}
            columns={artistColumns}
            getRowCanExpand={() => true}
            renderSubComponent={DebugTableRow}
          />
          <h3 className="text-lg" key="albums-header">
            Albums
          </h3>
          <ExpandableTable
            key="albums-table"
            data={searchResults.albums}
            columns={albumColumns}
            getRowCanExpand={() => true}
            renderSubComponent={DebugTableRow}
          />
          <h3 className="text-lg" key="playlists-header">
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
