import { getSpotifySdk } from "@/app/_lib/spotify-sdk";
import { msToDisplayDuration } from "@/app/_lib/unit-conversion";
import { SearchMatch } from "@/app/_types/search";
import {
  ItemTypes,
  TrackWithAlbum,
  Image,
} from "@spotify/web-api-ts-sdk/dist/mjs/types";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getSmallestImage = (images: Image[] | null) => {
  if (!images?.length) return null;
  return images.reduce((smallest, image) =>
    image?.height * image?.width < smallest?.height * smallest?.width
      ? image
      : smallest
  );
};

export async function GET(request: NextRequest) {
  const userAccessToken = JSON.parse(
    cookies().get("SPOTIFY_USER_TOKEN")?.value ?? "{}"
  );
  if (!userAccessToken) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    const spotifyApi = getSpotifySdk(userAccessToken);
    const searchResults = await spotifyApi.search(
      request.nextUrl.searchParams.get("term") ?? "",
      (request.nextUrl.searchParams.getAll("types") as ItemTypes[]) ?? [
        "album",
        "artist",
        "playlist",
        "track",
      ],
      undefined,
      3
    );
    const responseBody: SearchMatch = {
      tracks: searchResults.tracks.items.map((t) => ({
        artists: t.artists.map((a) => ({
          name: a.name,
          id: a.id,
          type: a.type,
        })),
        name: t.name,
        duration: msToDisplayDuration(t.duration_ms),
        popularityScore: t.popularity,
        type: t.type,
        trackNumber: t.track_number,
        disc: t.disc_number,
        id: t.id,
        uri: t.uri,
        // docs say it should have the album
        album: {
          name: (t as TrackWithAlbum)?.album?.name,
          id: (t as TrackWithAlbum)?.album?.id,
          type: (t as TrackWithAlbum)?.album?.album_type,
          genres: (t as TrackWithAlbum)?.album?.genres,
          previewImage: getSmallestImage((t as TrackWithAlbum)?.album?.images),
          releaseDate: (t as TrackWithAlbum)?.album?.release_date,
          releaseDatePrecision: (t as TrackWithAlbum)?.album
            ?.release_date_precision,
        },
      })),
      artists: searchResults.artists.items.map((a) => ({
        name: a.name,
        uri: a.uri,
        previewImage: getSmallestImage(a.images),
        genres: a.genres,
        followersCount: a.followers?.total ?? "unknown",
        popularityScore: a.popularity,
      })),
      albums: searchResults.albums.items.map((a) => ({
        name: a.name,
        label: a.label,
        artists: a.artists.map((artist) => ({
          name: artist.name,
          id: artist.id,
          type: artist.type,
        })),
        type: a.album_type,
        releaseDate: a.release_date,
        releaseDatePrecision: a.release_date_precision,
        genres: a.genres,
        populatityScore: a.popularity,
        previewImage: getSmallestImage(a.images),
        group: a.album_group,
        tracksCount: a.total_tracks,
        id: a.id,
        uri: a.uri,
      })),
      playlists: searchResults.playlists.items.map((p) => ({
        name: p.name,
        description: p.description,
        creator: {
          name: p.owner.display_name,
          id: p.owner.id,
          type: p.owner.type,
        },
        isCollaborative: p.collaborative,
        isPublic: p.public,
        followersCount: p.followers,
        id: p.id,
        previewImage: getSmallestImage(p.images),
        type: p.type,
        colour: p.primary_color,
        uri: p.uri,
      })),
      isSearchComplete: true,
      isSearching: false,
    };
    return NextResponse.json(responseBody);
  } catch (error: any) {
    if (error.message.includes("expired token")) {
      return new NextResponse(error, { status: 401 });
    }
    return new NextResponse(error?.message ?? "Something went wrong", {
      status: 500,
    });
  }
}
