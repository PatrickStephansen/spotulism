import { Setter, atom } from "jotai";
import { Subject, debounceTime } from "rxjs";
import { SearchMatch, SearchParameters } from "../_types/search";

export const currentSearchTerm = atom<SearchParameters["term"]>("");
export const currentSearchTypes = atom<SearchParameters["types"]>([
  "album",
  "artist",
  "playlist",
  "track",
]);

const currentSearchAbort = atom<AbortController>(new AbortController());

export const searchMatches = atom<SearchMatch>({
  tracks: [],
  artists: [],
  albums: [],
  playlists: [],
  isSearching: false,
  isSearchComplete: false,
});

interface SubjectParams {
  search: SearchParameters;
  set: Setter;
  abort: AbortController;
}

const searchSubject = new Subject<SubjectParams>();
searchSubject
  .pipe(debounceTime(200))
  .subscribe(async ({ search, set, abort }) => {
    try {
      const searchResults = await fetch(
        `/api/general-search?term=${encodeURIComponent(
          search.term
        )}&types=${search.types.join("&types=")}`,
        { signal: abort.signal }
      );
      set(searchMatches, (await searchResults.json()) as SearchMatch);
    } catch (error) {
      if (error !== "newer search started") throw error;
    }
  });

export const doSearch = atom(
  (get) =>
    ({
      term: get(currentSearchTerm),
      types: get(currentSearchTypes),
    } as SearchParameters),
  async (get, set, newSearch: SearchParameters) => {
    get(currentSearchAbort).abort("newer search started");
    set(currentSearchTerm, newSearch.term);
    set(currentSearchTypes, newSearch.types);
    set(currentSearchAbort, new AbortController());
    if (newSearch.term.length < 1 || newSearch.types.length === 0) {
      set(searchMatches, {
        tracks: [],
        artists: [],
        albums: [],
        playlists: [],
        isSearching: false,
        isSearchComplete: false,
      });
    } else {
      set(searchMatches, (m) => ({
        ...m,
        isSearching: true,
        isSearchComplete: false,
      }));
      searchSubject.next({
        search: newSearch,
        set,
        abort: get(currentSearchAbort),
      });
    }
  }
);
