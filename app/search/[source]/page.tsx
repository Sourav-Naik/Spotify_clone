"use client";
import Link from "next/link";
import Image from "next/image";
import Track from "@/app/components/tracks";
import useSpotify from "@/app/hooks/useSpotify";
import limitState from "@/app/atoms/limitState";
import { alertState } from "@/app/atoms/alertState";
import { useParams, useRouter } from "next/navigation";
import RenderItems from "@/app/components/renderItems";
import ContentLoader from "@/app/components/ContentLoader";
import { useRecoilValue, useSetRecoilState } from "recoil";
import React, { useCallback, useEffect, useState } from "react";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const spotifyApi = useSpotify();

  const source: any = params.source;

  const limit: number = useRecoilValue(limitState);
  const setAlert = useSetRecoilState<any>(alertState);

  const [hover, setHover] = useState<any>(false);
  const [topResult, setTopResult] = useState<any>();
  const [loading, setLoading] = useState<any>(true);
  const [searchData, setSearchData] = useState<any>(source);
  const [searchedAlbums, setSearchedAlbums] = useState<any>();
  const [searchedTracks, setSearchedTracks] = useState<any>();
  const [searchedArtists, setSearchedArtists] = useState<any>();
  const [searchedPlaylists, setSearchedPlaylists] = useState<any>();

  const searchTopResultInIndia = useCallback(
    (searchData: any) => {
      return spotifyApi
        .search(searchData, ["artist", "track", "album", "playlist"], {
          limit: 1,
          market: "IN",
        })
        .then(function (data: any) {
          const topArtist = data.body.artists?.items[0];
          const topTrack = data.body.tracks?.items[0];
          const topPlaylist = data.body.playlists?.items[0];
          const topAlbum = data.body.albums?.items[0];

          const searchTerm = searchData.toLowerCase();

          if (topArtist && topArtist.name.toLowerCase().includes(searchTerm)) {
            setTopResult(topArtist);
          } else if (
            topTrack &&
            topTrack.name.toLowerCase().includes(searchTerm)
          ) {
            setTopResult(topTrack);
          } else if (
            topAlbum &&
            topAlbum.name.toLowerCase().includes(searchTerm)
          ) {
            setTopResult(topAlbum);
          } else if (
            topPlaylist &&
            topPlaylist.name.toLowerCase().includes(searchTerm)
          ) {
            setTopResult(topPlaylist);
          } else {
            setTopResult(topArtist);
          }
        })
        .catch(function (err) {
          console.error("Error searching for top result:", err);
        });
    },
    [spotifyApi]
  );

  const searchTracks = useCallback(
    (searchData: any) => {
      return spotifyApi.searchTracks(searchData, { limit: 4 }).then(
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

  const handlePlay = useCallback(() => {
    console.log(topResult);
    if (topResult.type === "track") {
      spotifyApi
        .play({
          uris: [topResult.uri],
        })
        .then(function () {
          console.log("Playback started successfully");
        })
        .catch(function (err) {
          console.log("Something went wrong!", err);
        });
    }
    if (topResult.type === "playlist" || topResult.type === "album") {
      spotifyApi
        .play({
          context_uri: topResult.uri,
        })
        .then(function () {
          console.log("Playback started successfully");
        })
        .catch(function (err) {
          console.log("Something went wrong!", err);
        });
    }
  }, [spotifyApi, topResult]);

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
    await searchTopResultInIndia(searchData);
    await searchTracks(searchData);
    await searchPlaylists(searchData);
    await searchAlbums(searchData);
    await searchArtists(searchData);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

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
          <div className="xs:pt-14 px-2 xs:px-4 flex flex-col w-full sticky top-0 z-[1] backdrop-blur-3xl py-2 ">
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
            <fieldset className="w-full flex items-center justify-start space-x-2 mt-2">
              <legend className="sr-only">Search Filter</legend>
              <label htmlFor="All" className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="filter"
                  id="All"
                  className="hidden peer"
                  checked
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
                  onChange={(e) =>
                    router.push(
                      `/search/${source}/${e.target.id.toLowerCase()}`
                    )
                  }
                />
                <span className={styleClass}>Songs</span>
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
          <div className="flex flex-col flex-1 xs:px-2 mt-4">
            <div className={`flex flex-wrap ${limit < 4 && "flex-col"}`}>
              {/* top pick */}
              {topResult && (
                <div className="flex-1 px-2 xs:px-3 max-w-lg xs:min-w-[400px] mb-4 ">
                  <p
                    className={`text-lg font-bold mb-2 ${
                      limit >= 2 ? "xs:text-2xl" : "xs:text-xl"
                    }`}
                  >
                    Top Result
                  </p>
                  <Link
                    className="flex flex-col active:bg-[#a7a7a788] bg-slate-400 bg-opacity-10 hover:bg-opacity-20 p-4 rounded-lg relative"
                    href={"/" + topResult.type + "/" + topResult.id}
                    onMouseEnter={() => {
                      setHover(true);
                    }}
                    onMouseLeave={() => {
                      setHover(false);
                    }}
                  >
                    <Image
                      src={
                        topResult.type === "track"
                          ? topResult.album.images[0].url
                          : topResult.images[0].url
                      }
                      alt=""
                      height="100"
                      width="100"
                      className="rounded me-4"
                    />
                    <div className="truncate text-xl xs:text-2xl font-bold pt-3 capitalize">
                      {topResult.name}
                    </div>
                    <div className="capitalize text-xs xs:text-sm font-light text-[#a7a7a7]">
                      {topResult.type}
                    </div>
                    {hover && topResult.type !== "artist" && (
                      <button
                        className="material-symbols-outlined rounded-full bg-green-500 text-black p-3 absolute end-4 bottom-3 z-10"
                        onClick={handlePlay}
                        style={{
                          fontVariationSettings: '"FILL" 1, "wght" 700',
                        }}
                      >
                        play_arrow
                      </button>
                    )}
                  </Link>
                </div>
              )}
              <div className="flex-1 max-w-16" />
              {/* songs */}
              {searchedTracks && (
                <div className="flex-1 max-w-5xl px-2 xs:px-3 xs:min-w-[400px] mb-4">
                  <p
                    className={`text-lg font-bold mb-2 ${
                      limit >= 2 ? "xs:text-2xl" : "xs:text-xl"
                    }`}
                  >
                    Songs
                  </p>
                  {searchedTracks.map((item: any, index: any) => (
                    <Track
                      key={index}
                      track={item}
                      index={index}
                      limit={limit}
                    />
                  ))}
                </div>
              )}
            </div>

            {searchedArtists && (
              <RenderItems items={searchedArtists} name="Artists" />
            )}
            {searchedAlbums && (
              <RenderItems items={searchedAlbums} name="Albums" />
            )}
            {searchedPlaylists && (
              <RenderItems items={searchedPlaylists} name="Playlist" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
