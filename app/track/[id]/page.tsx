"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Home from "@/app/components/homeLoader";
import limitState from "@/app/atoms/limitState";
import useSpotify from "@/app/hooks/useSpotify";
import dp from "@/app/Images/defaultProfilePic.jpg";
import { alertState } from "@/app/atoms/alertState";
import { usePlayTrack } from "@/app/hooks/playTrack";
import GetImageColor from "@/app/hooks/GetImageColor";
import { likedSongsState } from "@/app/atoms/userInfo";
import RenderItems from "@/app/components/renderItems";
import { useCallback, useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import ContentLoader from "@/app/components/ContentLoader";

export default function Page() {
  const params = useParams();
  const spotifyApi = useSpotify();
  const playTrack = usePlayTrack();
  const { data: session } = useSession();

  const id: any = params.id;

  const limit: number = useRecoilValue(limitState);
  const setAlert = useSetRecoilState<any>(alertState);
  const setUserSongs = useSetRecoilState<any>(likedSongsState);

  const [track, setTrack] = useState<any>();
  const [artists, setArtists] = useState<any[]>([]);
  const [duration, setDuration] = useState("0min 0sec");
  const [loading, setLoading] = useState<boolean>(true);
  const [color, setColor] = useState<string>("transparent");
  const [relatedArtist, setRelatedArtist] = useState<any[]>([]);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);
  const [artistRelatedAlbums, setArtistRelatedAlbums] = useState<any[]>([]);

  const durationCalculator = useCallback((duration: any) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = parseInt(((duration % 60000) / 1000).toFixed(0));
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  const removeTrackFromSavedTracks = useCallback(() => {
    spotifyApi.removeFromMySavedTracks([id]).then(
      function () {
        setSavedStatus(false);
        setAlert({ show: true, msg: "Track Removed", type: "warning" });
        setTimeout(() => {
          spotifyApi.getMySavedTracks().then(
            function (data) {
              setUserSongs(data?.body?.items ?? []);
            },
            function (err) {
              console.error("Error fetching user saved songs:", err);
            }
          );
        }, 200);
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }, [spotifyApi]);

  const addTrackToSavedTracks = useCallback(() => {
    spotifyApi.addToMySavedTracks([id]).then(
      function () {
        setSavedStatus(true);
        setAlert({ show: true, msg: "Track Saved", type: "success" });
        setTimeout(() => {
          spotifyApi.getMySavedTracks().then(
            function (data) {
              setUserSongs(data?.body?.items ?? []);
            },
            function (err) {
              console.error("Error fetching user saved songs:", err);
            }
          );
        }, 200);
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }, [spotifyApi]);

  const fetchTrack = useCallback(
    async (id: any) => {
      try {
        const data = await spotifyApi.getTrack(id);
        setTrack(data?.body);
        setDuration(durationCalculator(data?.body?.duration_ms));
        const color = await GetImageColor(data?.body?.album?.images[0]?.url);
        setColor(color);
      } catch (error) {
        console.error(error);
      }
    },
    [durationCalculator]
  );

  const fetchSavedStatus = useCallback(
    (id: any) => {
      return spotifyApi.containsMySavedTracks([id]).then(
        function (data) {
          const trackIsInYourMusic = data?.body?.[0];
          setSavedStatus(trackIsInYourMusic);
        },
        function (error) {
          console.error(error);
        }
      );
    },
    [spotifyApi]
  );

  const fetchArtists = useCallback(async (track: any) => {
    try {
      const artistsData = await Promise.all(
        track?.artists.map(async (artist: any) => {
          const data = await spotifyApi.getArtist(artist?.id);
          return data?.body;
        })
      );
      setArtists(artistsData);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchArtistRelatedAlbums = async (artists: any) => {
    try {
      const albumsData = await Promise.all(
        artists?.map(async (artist: any) => {
          const data = await spotifyApi.getArtistAlbums(artist?.id);
          return {
            artist: artist,
            albums: data?.body?.items ?? [],
          };
        })
      );
      setArtistRelatedAlbums(albumsData);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRelatedArtist = async (id: any) => {
    try {
      const data = await spotifyApi.getArtistRelatedArtists(id);
      setRelatedArtist(data?.body?.artists ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTrack(id);
      fetchSavedStatus(id);
    }
  }, [session, id]);

  useEffect(() => {
    if (track) {
      fetchArtists(track);
    }
  }, [track]);

  useEffect(() => {
    if (artists.length > 0) {
      fetchArtistRelatedAlbums(artists);
    }
    if (artists.length === 1) {
      fetchRelatedArtist(artists[0].id);
    }
  }, [artists]);

  return (
    <>
      {loading ? (
        <ContentLoader />
      ) : track && track.name !== "" ? (
        <div className=" w-full h-full capitalize">
          <div
            style={{
              background: `linear-gradient(to bottom, ${color}, #121212)`,
            }}
          >
            <div className="p-6 pb-40 flex flex-col xs:flex-row xs:items-end backdrop-brightness-100">
              <div className="sm:min-w-[140px]">
                <Image
                  src={track?.album?.images[0]?.url || dp}
                  alt="Album Cover"
                  width="232"
                  height="232"
                  className="rounded-lg xs:min-w-28"
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
                  {track.name}
                </div>
                <p className="text-xs xs:text-sm mt-2 xs:mt-4 flex flex-wrap items-end">
                  <Link
                    href={`/album/${track.album.id}`}
                    className="pe-1 font-semibold hover:underline"
                  >
                    {track.album.name}
                  </Link>
                  <span className="font-black pe-1">∙</span>
                  {track.artists.map((artist: any, index: number) => (
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
                  <span className="pe-1">
                    {track.album.release_date.slice(0, 4)}
                  </span>
                  <span className="pe-1 font-black">∙</span>
                  <span>{duration}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="relative w-full">
            <div className="absolute top-[-140px] backdrop-blur-3xl backdrop-brightness-[.8] w-full px-4">
              {/* button fetures */}
              <div className="h-24 flex items-center px-2 justify-between">
                <div className="flex space-x-4 items-center">
                  <button
                    onClick={() => playTrack(track)}
                    disabled={track.preview_url === null}
                    className="material-symbols-outlined rounded-full bg-green-500 text-black p-3"
                    style={{
                      fontVariationSettings: '"FILL" 1, "wght" 700',
                    }}
                  >
                    play_arrow
                  </button>
                  {savedStatus ? (
                    <button
                      className="material-symbols-outlined text-green-500 hover:scale-125 active:scale-100 text-3xl xs:text-4xl"
                      style={{
                        fontVariationSettings: '"FILL" 1, "wght" 500',
                      }}
                      onClick={removeTrackFromSavedTracks}
                    >
                      check_circle
                    </button>
                  ) : (
                    <button
                      className="material-symbols-outlined text-[#dcdcdc] hover:scale-125 active:scale-100 text-3xl xs:text-4xl"
                      style={{
                        fontVariationSettings: '"FILL" 0, "wght" 500',
                      }}
                      onClick={addTrackToSavedTracks}
                    >
                      add_circle
                    </button>
                  )}
                </div>
              </div>

              {/* artist related song*/}
              <div className="flex flex-wrap flex-col sm:flex-row max-w-fit">
                {artists.map((artist: any) => {
                  return (
                    <Link
                      key={artist.id}
                      href={`/artist/${artist.id}`}
                      className=" flex-1 flex text-nowrap items-center px-1 py-2 max-w-80 sm:min-w-96  sm:max-w-fit rounded-xl hover:bg-opacity-25 hover:bg-slate-400"
                    >
                      <div className="rounded-full w-14 h-14 xs:w-20 xs:h-20 sm:w-28 sm:h-28 relative">
                        <Image
                          src={artist.images[0].url}
                          alt=""
                          layout="fill" // Make sure to use layout="fill" for responsive images
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="ps-4 flex flex-col">
                        <span className="text-xs text-[#b3b3b3]">Artist</span>
                        <span className="text-sm xs:text-base xs:font-bold">
                          {artist.name}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* album related song artist */}
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

                {/* fanalsoLike */}
                {relatedArtist.length > 0 && (
                  <RenderItems
                    items={relatedArtist}
                    name={`Fan Also Like`}
                    href={`/artist/${artists[0].id}/related`}
                  />
                )}
              </div>
              {artistRelatedAlbums[0].albums.length < 1 &&
                relatedArtist.length === 0 && (
                  <div className="relative top-[-55px]">
                    <Home />
                  </div>
                )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <p>Sorry! This song could not be found.</p>
          <Link
            href="/"
            className="border rounded px-4 py-2 mt-2 hover:scale-105 active:scale-95"
          >
            Go to home page
          </Link>
        </div>
      )}
    </>
  );
}
