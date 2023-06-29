import { atom } from "jotai";
import { SearchMatch } from "../_types/search";

export const currentSearchTerm = atom<string>("");

export const searchMatches = atom<SearchMatch>({});

export const doSearch = atom<string, [string], SearchMatch>(
  (get) => get(currentSearchTerm),
  async (_get, set, newSearch) => {
    set(currentSearchTerm, newSearch);
    const searchResults = await fetch(
      `/api/general-search?query=${encodeURIComponent(newSearch)}`
    );
    set(searchMatches, await searchResults.json());
  }
);
