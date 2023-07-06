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
}

const searchSubject = new Subject<SubjectParams>();
searchSubject.pipe(debounceTime(200)).subscribe(async ({ search, set }) => {
  const searchResults = await fetch(
    `/api/general-search?term=${encodeURIComponent(
      search.term
    )}&types=${search.types.join("&types=")}`
  );
  set(searchMatches, {
    ...(await searchResults.json()),
    isSearchComplete: true,
    isSearching: false,
  } as SearchMatch);
});

export const doSearch = atom(
  (get) =>
    ({
      term: get(currentSearchTerm),
      types: get(currentSearchTypes),
    } as SearchParameters),
  async (_get, set, newSearch: SearchParameters) => {
    set(currentSearchTerm, newSearch.term);
    set(currentSearchTypes, newSearch.types);
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
      searchSubject.next({ search: newSearch, set });
    }
  }
);
