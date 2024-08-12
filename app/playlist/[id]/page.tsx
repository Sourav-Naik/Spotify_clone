"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import Track from "@/app/components/tracks";
import { useSession } from "next-auth/react";
import limitState from "@/app/atoms/limitState";
import useSpotify from "@/app/hooks/useSpotify";
import useSpotifyQueue from "@/app/hooks/getQueue";
import { alertState } from "@/app/atoms/alertState";
import dp from "@/app/Images/defaultProfilePic.jpg";
import GetImageColor from "@/app/hooks/GetImageColor";
import { useCallback, useEffect, useState } from "react";
import { userPlaylistState } from "@/app/atoms/userInfo";
import ContentLoader from "@/app/components/ContentLoader";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

export default function PlaylistPage() {
  const params = useParams();
  const spotifyApi = useSpotify();
  const { data: session } = useSession();
  const { fetchQueue: updateQueue } = useSpotifyQueue();

  const id: any = params.id;

  const limit: number = useRecoilValue(limitState);
  const setAlert = useSetRecoilState<any>(alertState);
  const [userPlaylist, setUserPlaylist] = useRecoilState<any>(userPlaylistState);

  const [tracks, setTracks] = useState<any>([]);
  const [playlist, setPlaylist] = useState<any>();
  const [formatmenu, setFormatmenu] = useState(false);
  const [viewFormat, setViewFormat] = useState("List");
  const [duration, setDuration] = useState("0min 0sec");
  const [loading, setLoading] = useState<boolean>(true);
  const [color, setColor] = useState<string>("transparent");
  const [prevLimit, setPrevLimit] = useState<number>(limit);
  const [followingStatus, setFollowingStatus] = useState<boolean>(false);

  const unfollowPlaylist = useCallback(() => {
    spotifyApi.unfollowPlaylist(id).then(
      function () {
        setFollowingStatus(false);

        setAlert({ show: true, msg: "Playlist Removed", type: "warning" });
        setTimeout(() => {
          spotifyApi
            .getUserPlaylists()
            .then((data) => setUserPlaylist(data.body.items))
            .catch((error) =>
              console.error("Error fetching user saved albums:", error)
            );
        }, 200);
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }, [spotifyApi]);

  const followPlaylist = useCallback(() => {
    spotifyApi.followPlaylist(id).then(
      function () {
        setFollowingStatus(true);
        setAlert({ show: true, msg: "Playlist Saved", type: "success" });
        setTimeout(() => {
          spotifyApi
            .getUserPlaylists()
            .then((data) => setUserPlaylist(data.body.items))
            .catch((error) =>
              console.error("Error fetching user saved albums:", error)
            );
        }, 200);
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }, [spotifyApi]);

  const checkFollowStatus = useCallback(() => {
    userPlaylist.map((playlist: any) => {
      if (playlist.id === id) {
        setFollowingStatus(true);
      }
    });
  }, [userPlaylist]);

  const durationCalculator = useCallback((tracks: any) => {
    let duration: any = 0;
    tracks.map((track: any) => {
      duration = track?.duration_ms + duration;
    });
    const minutes = Math.floor(duration / 60000);
    const seconds = parseInt(((duration % 60000) / 1000).toFixed(0));
    return `${minutes}min ${seconds < 10 ? "0" : ""}${seconds}sec`;
  }, []);

  const changeViewFormat = useCallback((to: any) => {
      if (to === viewFormat) return setFormatmenu(false);
      setViewFormat(to);
      setFormatmenu(false);
    },
    [viewFormat]
  );

  const formatNumber = useCallback((num: any) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    } else {
      return num.toString();
    }
  }, []);

  const playPlaylist = useCallback(async () => {
    await spotifyApi.play({
      context_uri: `spotify:playlist:${id}`,
    });
    setTimeout(() => {
      updateQueue();
    }, 500);
  }, [spotifyApi]);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (session) {
        try {
          const data = await spotifyApi.getPlaylist(id);
          setPlaylist(data.body);

          const newArray = data.body.tracks.items.map((item) => item.track);
          setTracks(newArray);
          setDuration(durationCalculator(newArray));
          try {
            const color = await GetImageColor(data.body.images[0].url);
            setColor(color);
            setTimeout(() => {
              setLoading(false);
            }, 500);
          } catch (error) {
            console.error(error);
            setLoading(false);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchPlaylist();
  }, [session]);

  useEffect(() => {
    setPrevLimit(limit);
    if (limit <= 4) return setViewFormat("Compact");
    if (limit <= 5 && prevLimit < limit) return setViewFormat("List");
  }, [limit]);

  useEffect(() => {
    checkFollowStatus();
  }, [userPlaylist]);

  return (
    <>
      {loading ? (
        <ContentLoader />
      ) : (
        <div className="w-full h-full capitalize">
          {/* intro of playlist */}
          <div
            style={{
              background: `linear-gradient(to bottom, ${color}, #121212)`,
            }}
          >
            <div className="p-6 pb-40 flex flex-col xs:flex-row xs:items-end backdrop-brightness-100">
              <div className="sm:min-w-[140px]">
                <Image
                  src={playlist.images[0].url || dp}
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
                  {playlist.name}
                </div>
                <p className="mt-2 xs:mt-4 text-xs text-wrap">
                  {playlist.description}
                </p>
                <div className="text-xs xs:text-sm mt-2 xs:mt-4 flex flex-wrap items-end">
                  <span className="pe-1 font-semibold">
                    {playlist.owner.display_name}
                  </span>
                  <span className="pe-1 font-black">∙</span>
                  <span className="pe-1">
                    {formatNumber(playlist.followers.total)} listeners
                  </span>
                  <span className="pe-1 font-black">∙</span>
                  <span className="pe-1">{tracks.length} Songs,</span>
                  <span className="text-xs">about {duration} long.</span>
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
                    onClick={playPlaylist}
                    className="material-symbols-outlined rounded-full bg-green-500 text-black p-3"
                    style={{
                      fontVariationSettings: '"FILL" 1, "wght" 700',
                    }}
                  >
                    play_arrow
                  </button>
                  {followingStatus ? (
                    <button
                      className="material-symbols-outlined text-green-500 hover:scale-125 active:scale-100 text-3xl xs:text-4xl"
                      style={{
                        fontVariationSettings: '"FILL" 1, "wght" 500',
                      }}
                      onClick={unfollowPlaylist}
                    >
                      check_circle
                    </button>
                  ) : (
                    <button
                      className="material-symbols-outlined text-[#dcdcdc] hover:scale-125 active:scale-100 text-3xl xs:text-4xl"
                      style={{
                        fontVariationSettings: '"FILL" 0, "wght" 500',
                      }}
                      onClick={followPlaylist}
                    >
                      add_circle
                    </button>
                  )}
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

              {/* track list header */}
              <div className="flex bg-[#2e2e2e] px-2 mb-2 items-center sticky top-0">
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

              {/* track list */}
              {tracks.map((track: any, index: any) => (
                <Track
                  key={index}
                  track={track}
                  index={index}
                  limit={limit}
                  viewFormat={viewFormat}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
