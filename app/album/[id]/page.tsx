"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import Track from "@/app/components/tracks";
import { useSession } from "next-auth/react";
import Home from "@/app/components/homeLoader";
import useSpotify from "@/app/hooks/useSpotify";
import limitState from "../../atoms/limitState";
import useSpotifyQueue from "@/app/hooks/getQueue";
import { alertState } from "@/app/atoms/alertState";
import { userAlbumState } from "@/app/atoms/userInfo";
import GetImageColor from "@/app/hooks/GetImageColor";
import RenderItems from "@/app/components/renderItems";
import { useCallback, useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import ContentLoader from "@/app/components/ContentLoader";

export default function AlbumPage() {
  const params = useParams();
  const spotifyApi = useSpotify();
  const { data: session } = useSession();
  const { fetchQueue: updateQueue } = useSpotifyQueue();

  const id: any = params.id;

  const limit: number = useRecoilValue(limitState);
  const setUserAlbum = useSetRecoilState<any>(userAlbumState);
  const setAlert = useSetRecoilState<any>(alertState);

  const [album, setAlbum] = useState<any>();
  const [artists, setArtists] = useState<any[]>([]);
  const [formatmenu, setFormatmenu] = useState(false);
  const [viewFormat, setViewFormat] = useState("List");
  const [duration, setDuration] = useState("0min 0sec");
  const [loading, setLoading] = useState<boolean>(true);
  const [color, setColor] = useState<string>("transparent");
  const [prevLimit, setPrevLimit] = useState<number>(limit);
  const [relatedArtist, setRelatedArtist] = useState<any[]>([]);
  const [followingStatus, setFollowingStatus] = useState<boolean>(false);
  const [artistRelatedAlbums, setArtistRelatedAlbums] = useState<any[]>([]);

  const unfollowAlbum = useCallback(() => {
    spotifyApi.removeFromMySavedAlbums([id]).then(
      function () {
        setFollowingStatus(false);
        setAlert({ show: true, msg: "Album Unfollowed", type: "warning" });
        setTimeout(() => {
          spotifyApi
            .getMySavedAlbums()
            .then((data) => setUserAlbum(data.body.items))
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

  const followAlbum = useCallback(() => {
    spotifyApi.addToMySavedAlbums([id]).then(
      function () {
        setFollowingStatus(true);
        setAlert({ show: true, msg: "Album Followed", type: "success" });
        setTimeout(() => {
          spotifyApi
            .getMySavedAlbums()
            .then((data) => setUserAlbum(data.body.items))
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

  const fetchArtists = useCallback(
    async (album: any) => {
      try {
        const artistsData = await Promise.all(
          album.artists.map(async (artist: any) => {
            const data = await spotifyApi.getArtist(artist.id);
            return data.body;
          })
        );
        setArtists(artistsData);
      } catch (err) {
        console.error(err);
      }
    },
    [spotifyApi]
  );

  const fetchArtistRelatedAlbums = useCallback(
    async (artists: any) => {
      try {
        const albumsData = await Promise.all(
          artists.map(async (artist: any) => {
            const data = await spotifyApi.getArtistAlbums(artist.id);
            return {
              artist: artist,
              albums: data.body.items,
            };
          })
        );
        setArtistRelatedAlbums(albumsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    },
    [spotifyApi]
  );

  const fetchRelatedArtist = useCallback(
    async (id: any) => {
      try {
        const data: any = await spotifyApi.getArtistRelatedArtists(id);
        setRelatedArtist(data.body.artists);
      } catch (error) {
        console.error(error);
      }
    },
    [spotifyApi]
  );

  const durationCalculator = useCallback(
    (tracks: any) => {
      let duration: any = 0;
      tracks.map((track: any) => {
        duration = track?.duration_ms + duration;
      });
      const minutes = Math.floor(duration / 60000);
      const seconds = parseInt(((duration % 60000) / 1000).toFixed(0));
      return `${minutes}min ${seconds < 10 ? "0" : ""}${seconds}sec`;
    },
    [spotifyApi]
  );

  const formatDate = useCallback(
    (dateString: any) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    [spotifyApi]
  );

  const changeViewFormat = useCallback(
    (to: any) => {
      if (to === viewFormat) return setFormatmenu(false);
      setViewFormat(to);
      setFormatmenu(false);
    },
    [spotifyApi]
  );

  const checkFollowStatus = useCallback(() => {
    spotifyApi
      .containsMySavedAlbums([id])
      .then((response) => {
        const isSaved = response.body[0];
        setFollowingStatus(isSaved);
      })
      .catch((error) => {
        console.error("Error checking if album is saved:", error);
      });
  }, [spotifyApi]);

  const playAlbum = useCallback(async () => {
    await spotifyApi.play({
      context_uri: `spotify:album:${id}`,
    });

    setTimeout(() => {
      updateQueue();
    }, 500);
  }, [spotifyApi]);

  useEffect(() => {
    if (session) {
      checkFollowStatus();
      spotifyApi.getAlbum(id).then(
        async function (data) {
          setAlbum(data.body);
          setDuration(durationCalculator(data.body.tracks.items));
          GetImageColor(data.body.images[0].url)
            .then(function (color) {
              setColor(color);
              setTimeout(() => {
                setLoading(false);
              }, 500);
            })
            .catch(function (error) {
              console.log(error);
              setLoading(false);
            });
        },
        function (err) {
          console.error(err);
        }
      );
    }
  }, [session]);

  useEffect(() => {
    if (album) {
      fetchArtists(album);
    }
  }, [album]);

  useEffect(() => {
    if (artists.length > 0) {
      fetchArtistRelatedAlbums(artists);
    }
    if (artists.length === 1) {
      fetchRelatedArtist(artists[0].id);
    }
  }, [artists]);

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
          {/* intro of album */}
          <div
            style={{
              background: `linear-gradient(to bottom, ${color}, #121212)`,
            }}
          >
            <div className="p-6 pb-40 flex flex-col xs:flex-row xs:items-end backdrop-brightness-100">
              <div className="sm:min-w-[140px]">
                <Image
                  src={album.images[0].url}
                  alt="Album Cover"
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
                  {album.name}
                </div>
                <div className="text-xs xs:text-sm mt-2 xs:mt-4 flex flex-wrap items-end">
                  {album.artists.map((artist: any, index: number) => (
                    <span key={index}>
                      {index > 0 && <span className="pe-1 font-black">∙</span>}
                      <Link
                        className="pe-1 font-semibold hover:underline"
                        href={`/artist/${artist.id}`}
                      >
                        {artist.name}
                      </Link>
                    </span>
                  ))}
                  <span className="pe-1 font-black">∙</span>
                  <span className="pe-1">{album.release_date.slice(0, 4)}</span>
                  <span className="pe-1 font-black">∙</span>
                  <span className="pe-1">{album.total_tracks} Songs,</span>
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
                    onClick={playAlbum}
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
                      onClick={unfollowAlbum}
                    >
                      check_circle
                    </button>
                  ) : (
                    <button
                      className="material-symbols-outlined text-[#dcdcdc] hover:scale-125 active:scale-100 text-3xl xs:text-4xl"
                      style={{
                        fontVariationSettings: '"FILL" 0, "wght" 500',
                      }}
                      onClick={followAlbum}
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

              <div>
                {/* track list header */}
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
                {album.tracks.items.map((track: any, index: any) => {
                  const trackWithAlbum = {
                    ...track,
                    album: album,
                  };

                  return (
                    <Track
                      key={index}
                      track={trackWithAlbum}
                      index={index}
                      limit={limit}
                      viewFormat={viewFormat}
                    />
                  );
                })}
              </div>

              {/* copyrightes */}
              <div className="text-xs text-[#b3b3b3] px-2 py-4 sm:p-6">
                <div className="text-sm">{formatDate(album.release_date)}</div>
                {album.copyrights.map((item: any, index: any) => {
                  return <div key={index}>© {item.text}</div>;
                })}
              </div>

              {/* albums related  to artists */}
              {artistRelatedAlbums.length > 0 && (
                <div className="flex flex-col mt-6 space-y-4">
                  {artistRelatedAlbums.map((relatedAlbums: any, index: any) => {
                    if (relatedAlbums.albums.length > 0) {
                      return (
                        <RenderItems
                          key={index}
                          items={relatedAlbums.albums}
                          name={`Featuring ${relatedAlbums.artist.name}`}
                          href={`/artist/${relatedAlbums.artist.id}/featuring`}
                        />
                      );
                    }
                  })}
                </div>
              )}

              {/* fanalsoLike */}
              {relatedArtist.length > 0 && (
                <RenderItems
                  items={relatedArtist}
                  name={`Fan Also Like`}
                  href={`/artist/${artists[0].id}/related`}
                />
              )}

              {artistRelatedAlbums[0]?.albums.length < 1 &&
                relatedArtist.length === 0 && (
                  <div className="relative top-[-55px]">
                    <Home />
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
