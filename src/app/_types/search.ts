import { ItemTypes } from "@spotify/web-api-ts-sdk/dist/mjs/types";

export interface SearchMatch {
  tracks: any[];
  artists: any[];
  albums: any[];
  playlists: any[];
}

export interface SearchParameters {
  term: string,
  types: ItemTypes[]
}
