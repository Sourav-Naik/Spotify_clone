"use client";
import Track from "@/app/components/tracks";
import useSpotify from "@/app/hooks/useSpotify";
import limitState from "@/app/atoms/limitState";
import { alertState } from "@/app/atoms/alertState";
import { useParams, useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import ContentLoader from "@/app/components/ContentLoader";
import React, { useCallback, useEffect, useState } from "react";
import ArtistCover from "@/app/components/Cover Components/ArtistCover";
import AlbumsCover from "@/app/components/Cover Components/AlbumsCover";
import PlaylistCover from "@/app/components/Cover Components/PlaylistCover";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const spotifyApi = useSpotify();
  const source: any = params.source;
  const type: any = params.type;

  const limit: number = useRecoilValue(limitState);
  const setAlert = useSetRecoilState<any>(alertState);

  const [loading, setLoading] = useState<any>(true);
  const [viewFormat, setViewFormat] = useState("List");
  const [prevLimit, setPrevLimit] = useState<number>(limit);
  const [searchData, setSearchData] = useState<any>(source);
  const [searchedAlbums, setSearchedAlbums] = useState<any>();
  const [searchedTracks, setSearchedTracks] = useState<any>();
  const [searchedArtists, setSearchedArtists] = useState<any>();
  const [searchedPlaylists, setSearchedPlaylists] = useState<any>();

  const searchTracks = useCallback(
    (searchData: any) => {
      return spotifyApi.searchTracks(searchData).then(
        function (data: any) {
          setSearchedTracks(data.body.tracks.items);
        },
        function (err) {
          console.error(err);
        }
      );
    },
    [spotifyApi]
  );

  const searchArtists = useCallback(
    (searchData: any) => {
      return spotifyApi.searchArtists(searchData).then(
        function (data: any) {
          setSearchedArtists(data.body.artists.items);
        },
        function (err) {
          console.error(err);
        }
      );
    },
    [spotifyApi]
  );

  const searchPlaylists = useCallback(
    (searchData: any) => {
      return spotifyApi.searchPlaylists(searchData).then(
        function (data: any) {
          setSearchedPlaylists(data.body.playlists.items);
        },
        function (err) {
          console.log("Something went wrong!", err);
        }
      );
    },
    [spotifyApi]
  );

  const searchAlbums = useCallback(
    (searchData: any) => {
      return spotifyApi.searchAlbums(searchData).then(
        function (data: any) {
          setSearchedAlbums(data.body.albums.items);
        },
        function (err) {
          console.log("Something went wrong!", err);
        }
      );
    },
    [spotifyApi]
  );

  const handleSearch = useCallback(async () => {
    if (!searchData.trim()) {
      return setAlert({
        show: true,
        msg: "Search box is empty",
        type: "warning",
      });
    }
    router.push(`/search/${searchData}`);
  }, [searchData, setAlert, router]);

  const fetchData = useCallback(async () => {
    type === "song" && (await searchTracks(searchData));
    type === "playlist" && (await searchPlaylists(searchData));
    type === "album" && (await searchAlbums(searchData));
    type === "artist" && (await searchArtists(searchData));
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const gridClasses: any = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
    9: "grid-cols-9",
    10: "grid-cols-10",
    11: "grid-cols-11",
    12: "grid-cols-12",
  };

  useEffect(() => {
    setPrevLimit(limit);
    if (limit <= 4) return setViewFormat("Compact");
    if (limit <= 5 && prevLimit < limit) return setViewFormat("List");
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, []);

  const styleClass =
    "text-sm xs:text-base bg-slate-500 bg-opacity-25 px-3 py-1 rounded-full peer-checked:bg-white peer-checked:text-black";

  return (
    <div className="relative h-full w-full flex flex-col">
      {loading ? (
        <div className="absolute top-0 h-full w-full">
          <ContentLoader />
        </div>
      ) : (
        <>
          <div className="xs:pt-14 px-2 xs:px-4 sticky top-0 z-[1] backdrop-blur-3xl py-2 w-full">
            <div className="flex flex-col xs:w-fit">
              <div className="flex items-center relative xs:w-fit">
                <input
                  id="search"
                  type="search"
                  name="search"
                  value={searchData}
                  placeholder="Search"
                  onChange={(event) => setSearchData(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                  className="bg-transparent px-3 py-2 bg-white bg-opacity-15 rounded-full w-full xs:w-96"
                />
                <button
                  className="material-symbols-outlined text-white text-2xl absolute end-2 hover:scale-125 active:scale-100"
                  onClick={handleSearch}
                >
                  search
                </button>
              </div>
              <fieldset className="w-full flex items-center justify-between mt-2">
                <legend className="sr-only">Search Filter</legend>
                <label
                  htmlFor="All"
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="filter"
                    id="All"
                    className="hidden peer"
                    onChange={() => router.push(`/search/${searchData}`)}
                  />
                  <span className={styleClass}>All</span>
                </label>
                <label
                  htmlFor="Artist"
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="filter"
                    id="Artist"
                    className="hidden peer"
                    checked={type === "artist"}
                    onChange={(e) =>
                      router.push(
                        `/search/${source}/${e.target.id.toLowerCase()}`
                      )
                    }
                  />
                  <span className={styleClass}>Artists</span>
                </label>
                <label
                  htmlFor="Playlist"
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="filter"
                    id="Playlist"
                    className="hidden peer"
                    checked={type === "playlist"}
                    onChange={(e) =>
                      router.push(
                        `/search/${source}/${e.target.id.toLowerCase()}`
                      )
                    }
                  />
                  <span className={styleClass}>Playlists</span>
                </label>
                <label
                  htmlFor="Album"
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="filter"
                    id="Album"
                    className="hidden peer"
                    checked={type === "album"}
                    onChange={(e) =>
                      router.push(
                        `/search/${source}/${e.target.id.toLowerCase()}`
                      )
                    }
                  />
                  <span className={styleClass}>Albums</span>
                </label>
                <label
                  htmlFor="Song"
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="filter"
                    id="Song"
                    className="hidden peer"
                    checked={type === "song"}
                    onChange={(e) =>
                      router.push(
                        `/search/${source}/${e.target.id.toLowerCase()}`
                      )
                    }
                  />
                  <span className={styleClass}>Songs</span>
                </label>
              </fieldset>
            </div>
          </div>
          <div className="flex flex-col flex-1 xs:px-2 mt-4">
            {searchedTracks && (
              <div className="flex-1 xs:px-3 xs:min-w-[400px] mb-4">
                <p
                  className={`text-lg px-2 xs:p-0 font-bold mb-2 ${
                    limit >= 2 ? "xs:text-2xl" : "xs:text-xl"
                  }`}
                >
                  Songs
                </p>
                <div className="flex bg-[#2e2e2e] px-2 mb-2 items-center">
                  <div className={"xs:w-14 ps-2 pe-4 text-sm xs:text-lg"}>#</div>
                  <div className="flex-1 flex">
                    {limit >= 3 && (
                      <div className="rounded hidden sm:block mx-4 w-[50px]" />
                    )}
                    <p className="w-1/2">Title</p>
                    {viewFormat === "List" && <p className="w-1/2">Artist</p>}
                  </div>
                  <span className="material-symbols-outlined text-xl text-center w-[74px] xs:w-32">
                    schedule
                  </span>
                </div>
                {searchedTracks.map((item: any, index: any) => (
                  <Track
                    key={index}
                    track={item}
                    index={index}
                    limit={limit}
                    viewFormat={viewFormat}
                  />
                ))}
              </div>
            )}

            {searchedArtists && (
              <>
                <div className="text-2xl px-3 font-bold tracking-tight xs:pt-2">
                  Artists
                </div>
                <div
                  className={`xs:px-2 grid gap-2 xs:gap-4 ${
                    gridClasses[Math.min(limit, searchedArtists.length)] ||
                    "grid-cols-12"
                  }`}
                >
                  {searchedArtists.map((album: any, index: any) => {
                    return (
                      <div key={index}>
                        <ArtistCover artist={album} />
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {searchedAlbums && (
              <>
                <div className="text-2xl px-3 font-bold tracking-tight xs:pt-2">
                  Albums
                </div>
                <div
                  className={`xs:px-2 grid gap-2 xs:gap-4 ${
                    gridClasses[Math.min(limit, searchedAlbums.length)] ||
                    "grid-cols-12"
                  }`}
                >
                  {searchedAlbums.map((album: any, index: any) => (
                    <div key={index}>
                      <AlbumsCover album={album} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {searchedPlaylists && (
              <>
                <div className="text-2xl px-3 font-bold tracking-tight xs:pt-2">
                  Charts
                </div>
                <div
                  className={`xs:px-2 grid gap-2 xs:gap-4 ${
                    gridClasses[Math.min(limit, searchedPlaylists.length)] ||
                    "grid-cols-12"
                  }`}
                >
                  {searchedPlaylists.map((album: any, index: any) => (
                    <div key={index}>
                      <PlaylistCover album={album} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
