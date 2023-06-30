"use client";

import { ChangeEvent } from "react";
import { doSearch, searchMatches } from "../_state/current-search";
import { useAtom, useAtomValue } from "jotai";
import Image from "next/image";

interface Props {}

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
      <h3 className="text-lg m-2">Tracks</h3>
      <table>
        <thead>
          <th>Name</th>
          <th>Artist</th>
          <th>Album</th>
          <th>Release Date</th>
          <th>Duration</th>
        </thead>
        <tbody>
          {searchResults.tracks.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.artists.map((a) => a.name).join(", ")}</td>
              <td className="flex items-center"><Image alt="album art" width={30} height={30} src={t.album?.previewImageUrl} />{t?.album?.name}</td>
              <td>
                {t.album?.releaseDate ?? "unknown release date"}
              </td>
              <td>{t.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <pre>{JSON.stringify(searchResults, null, 2)}</pre>
    </>
  );
};
