"use client";
import Link from "next/link";
import Image from "next/image";
import { useRecoilValue } from "recoil";
import Track from "@/app/components/tracks";
import limitState from "@/app/atoms/limitState";
import useSpotify from "@/app/hooks/useSpotify";
import useSpotifyQueue from "@/app/hooks/getQueue";
import { useCallback, useEffect, useState } from "react";
import likedSongsThumbnail from "../Images/likedSongs.jpg";
import ContentLoader from "@/app/components/ContentLoader";
import { likedSongsState, userDetailsState } from "@/app/atoms/userInfo";

export default function PlaylistPage() {
  const spotifyApi = useSpotify();
  const { fetchQueue: updateQueue } = useSpotifyQueue();

  const user = useRecoilValue(userDetailsState);
  const limit: number = useRecoilValue(limitState);
  const userSongs = useRecoilValue<any>(likedSongsState);

  const [songs, setSongs] = useState(userSongs);
  const [formatmenu, setFormatmenu] = useState(false);
  const [viewFormat, setViewFormat] = useState("List");
  const [loading, setLoading] = useState<boolean>(true);
  const [prevLimit, setPrevLimit] = useState<number>(limit);

  const changeViewFormat = useCallback(
    (to: any) => {
      if (to === viewFormat) return setFormatmenu(false);
      setViewFormat(to);
      setFormatmenu(false);
    },
    [viewFormat]
  );

  const playAlbum = useCallback(async () => {
    await spotifyApi.play({
      context_uri: `spotify:user:${user.id}:collection`,
    });
    setTimeout(() => {
      updateQueue();
    }, 500);
  }, [spotifyApi]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    setSongs(userSongs);
  }, [userSongs]);

  useEffect(() => {
    setPrevLimit(limit);
    if (limit <= 4) return setViewFormat("Compact");
    if (limit <= 5 && prevLimit < limit) return setViewFormat("List");
  }, [limit]);

  return (
    <>
      {loading ? (
        <ContentLoader />
      ) : (
        <div className="w-full h-full capitalize">
          {/* intro of playlist */}
          <div className="bg-gradient-to-b from-[#6C4EEC] to-[#121212]">
            <div className="p-6 pb-40 flex flex-col xs:flex-row xs:items-end backdrop-brightness-100">
              <div className="sm:min-w-[140px]">
                <Image
                  src={likedSongsThumbnail}
                  alt="playlist Cover"
                  width="232"
                  height="232"
                  className="rounded-lg"
                />
              </div>
              <div className="flex flex-col xs:px-6 pt-6 xs:pt-0">
                {/* name */}
                <div
                  className={`${
                    limit < 3
                      ? "text-xl"
                      : limit < 4
                      ? "text-2xl"
                      : limit < 5
                      ? "text-3xl"
                      : limit < 6
                      ? "text-4xl"
                      : "text-5xl"
                  } font-black tracking-tight`}
                >
                  Liked Songs
                </div>

                <div className="text-xs xs:text-sm mt-2 xs:mt-4 flex flex-wrap items-center">
                  <Link
                    className="pe-1 font-semibold flex items-center hover:underline"
                    href="/profile"
                  >
                    {user?.images && (
                      <Image
                        src={user.images[1].url}
                        alt=""
                        width="300"
                        height="300"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <span className="ps-2">{user.display_name}</span>
                  </Link>
                  <span className="pe-1 font-black">∙</span>
                  <span className="pe-1">{userSongs.length} Songs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full">
            <div className="absolute top-[-140px] backdrop-blur-3xl backdrop-brightness-[.8] w-full xs:px-4">
              {/* button fetures */}
              <div className="h-24 flex items-center px-2 justify-between">
                <div className="flex space-x-4 items-center">
                  <button
                    onClick={playAlbum}
                    disabled={userSongs.length < 1}
                    className="material-symbols-outlined rounded-full bg-green-500 text-black p-3"
                    style={{ fontVariationSettings: '"FILL" 1, "wght" 700' }}
                  >
                    play_arrow
                  </button>
                </div>
                {/* view format button */}
                <div
                  className={`relative  text-[#b3b3b3] ${
                    limit <= 4 ? "hidden" : ""
                  }`}
                >
                  <button
                    className="hover:text text-sm flex items-center text-[#e8e0e0] hover:text-white"
                    onClick={() => {
                      formatmenu ? setFormatmenu(false) : setFormatmenu(true);
                    }}
                  >
                    {viewFormat}
                    <span className="material-symbols-outlined text-xl ms-1">
                      {viewFormat === "List" ? "format_list_bulleted" : "menu"}
                    </span>
                  </button>

                  {formatmenu && (
                    <div className="absolute top-8 right-4 z-20 bg-[#323232] p-2 rounded-lg">
                      <p className="text-xs text-start px-3">View as</p>
                      <button
                        className="flex items-center px-3 py-1 my-1 hover:bg-[#7a7a7a58] hover:text-white w-full rounded"
                        onClick={() => changeViewFormat("List")}
                      >
                        <span className="material-symbols-outlined text-xl me-2">
                          format_list_bulleted
                        </span>
                        <span className="w-20 text-start">List</span>
                        {viewFormat === "List" && (
                          <span className="material-symbols-outlined text-green-500 text-2xl">
                            check
                          </span>
                        )}
                      </button>
                      <button
                        className="flex items-center px-3 py-1 hover:bg-[#7a7a7a58] hover:text-white w-full rounded"
                        onClick={() => changeViewFormat("Compact")}
                      >
                        <span className="material-symbols-outlined text-xl me-2">
                          menu
                        </span>
                        <span className="w-20 text-start">Compact</span>
                        {viewFormat === "Compact" && (
                          <span className="material-symbols-outlined text-green-500 text-2xl">
                            check
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {songs.length > 0 ? (
                <>
                  <div className="flex bg-[#2e2e2e] px-2 mb-2 items-center sticky top-0">
                    <div className={"xs:w-14 ps-2 pe-4 text-sm xs:text-lg"}>
                      #
                    </div>
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

                  {songs.map((track: any, index: any) => (
                    <Track
                      index={index}
                      limit={limit}
                      key={track.track.id}
                      track={track.track}
                      viewFormat={viewFormat}
                      deletePermission={true}
                    />
                  ))}
                </>
              ) : (
                <div className="text-center text-xl font-semibold">
                  User has on liked song
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
