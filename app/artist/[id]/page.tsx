"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import Track from "@/app/components/tracks";
import { useSession } from "next-auth/react";
import Home from "@/app/components/homeLoader";
import useSpotify from "@/app/hooks/useSpotify";
import limitState from "@/app/atoms/limitState";
import useSpotifyQueue from "@/app/hooks/getQueue";
import { alertState } from "@/app/atoms/alertState";
import dp from "@/app/Images/defaultProfilePic.jpg";
import GetImageColor from "@/app/hooks/GetImageColor";
import RenderItems from "@/app/components/renderItems";
import { useCallback, useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import ContentLoader from "@/app/components/ContentLoader";

export default function ArtistPage() {
  const params = useParams();
  const id: any = params.id;
  const limit: number = useRecoilValue(limitState);
  const { data: session } = useSession();

  const setAlert = useSetRecoilState<any>(alertState);

  const [artist, setArtist] = useState<any>();
  const [items, setItems] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [popularPick, setPopularPick] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [color, setColor] = useState<string>("transparent");
  const [relatedArtist, setRelatedArtist] = useState<any[]>([]);
  const [followingStatus, setFollowingStatus] = useState<any>(false);

  const spotifyApi = useSpotify();
  const { fetchQueue: updateQueue } = useSpotifyQueue();

  const formatNumber = useCallback(
    (num: number) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "k";
      } else {
        return num.toString();
      }
    },
    [spotifyApi, id]
  );

  const playAllTracks = useCallback(async () => {
    if (!items?.length) return;
    try {
      const uris = items.map((track) => track?.uri);
      await spotifyApi.play({
        uris,
      });
      setTimeout(() => {
        updateQueue();
      }, 300);
    } catch (error) {
      console.error("Error playing tracks:", error);
    }
  }, [spotifyApi, id]);

  const followArtist = useCallback(() => {
    spotifyApi.followArtists([id]).then(
      function () {
        setFollowingStatus(true);
        setAlert({ show: true, msg: "Artist followed", type: "success" });
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }, [spotifyApi, id]);

  const unFollowArtist = useCallback(() => {
    spotifyApi.unfollowArtists([id]).then(
      function () {
        setAlert({ show: true, msg: "Artist Unfollowed", type: "warning" });
        setFollowingStatus(false);
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }, [spotifyApi, id]);

  const getFollowingStatus = useCallback(
    async (id: any) => {
      try {
        const data = await spotifyApi.isFollowingArtists([id]);
        if (!data || !data.body) return setFollowingStatus(false);
        const isFollowing: any = data.body[0];
        if (isFollowing) {
          setFollowingStatus(isFollowing);
        } else {
          setFollowingStatus(false);
        }
      } catch (err) {
        console.log(err);
        setFollowingStatus(false);
      }
    },
    [spotifyApi, id]
  );

  const getArtist = useCallback(() => {
    return spotifyApi.getArtist(id).then(
      function (data) {
        const artistData = data?.body;
        setArtist(artistData);
        const imageUrl = artistData?.images?.[0]?.url;
        if (imageUrl) {
          GetImageColor(imageUrl)
            .then((color) => {
              setColor(color);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      },
      function (err) {
        console.error(err);
      }
    );
  }, [spotifyApi, id]);

  const getTracks = useCallback(() => {
    return spotifyApi.getArtistTopTracks(id, "GB").then(
      function (data) {
        const tracks = data?.body?.tracks;
        setItems(tracks);
        if (tracks?.length) {
          const mostPopularTrack = tracks.reduce((maxTrack, track) => {
            return track?.popularity > maxTrack?.popularity ? track : maxTrack;
          }, tracks[0]);
          setPopularPick(mostPopularTrack);
        }
      },
      function (err) {
        console.error("Something went wrong!", err);
      }
    );
  }, [spotifyApi, id]);

  const getAlbums = useCallback(() => {
    return spotifyApi.getArtistAlbums(id).then(
      function (data) {
        setAlbums(data?.body?.items);
      },
      function (err) {
        console.error(err);
      }
    );
  }, [spotifyApi, id]);

  const getRelatedArtist = useCallback(() => {
    return spotifyApi.getArtistRelatedArtists(id).then(
      function (data) {
        setRelatedArtist(data?.body?.artists);
      },
      function (err) {
        console.error(err);
      }
    );
  }, [spotifyApi, id]);

  const fetchDetails = useCallback(async () => {
    await getArtist();
    await getTracks();
    await getAlbums();
    await getRelatedArtist();
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [spotifyApi, id]);

  useEffect(() => {
    getFollowingStatus(id);
  }, [session, followingStatus]);

  useEffect(() => {
    session && fetchDetails();
  }, [session]);

  return (
    <>
      {loading ? (
        <ContentLoader />
      ) : (
        artist && (
          <div className="w-full h-full capitalize">
            {/* intro of artist */}
            <div
              style={{
                background: `linear-gradient(to bottom, ${color}, #121212)`,
              }}
            >
              <div className="p-6 pb-80 flex flex-col xs:flex-row xs:items-end backdrop-brightness-100">
                <div
                  style={{
                    position: "relative",
                    height:
                      (limit <= 4 ? limit * 60 : 4 * 60).toString() + "px",
                    width: (limit <= 4 ? limit * 60 : 4 * 60).toString() + "px",
                  }}
                >
                  <Image
                    src={artist?.images[0]?.url || dp}
                    alt="artist Cover"
                    layout="fill"
                    className="rounded-full object-cover"
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
                    {artist && artist.name}
                  </div>
                  <div
                    className={`mt-2 xs:mt-4 tracking-tight ${
                      limit <= 2 ? "text-xs" : "text-sm"
                    }`}
                  >
                    {artist && formatNumber(artist.followers.total)} Monthly
                    Listeners
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full flex-1">
              <div className="absolute top-[-300px] backdrop-blur-3xl backdrop-brightness-150 w-full flex-1">
                {items?.length < 1 &&
                albums?.length < 1 &&
                relatedArtist?.length < 1 ? (
                  <div className="flex flex-col flex-1">
                    <div className="flex-1 text-start xs:text-center text-sm xs:text-base normal-case p-2 px-4">
                      Sorry! no songs available for the artist {artist.name}
                    </div>
                    <div className="relative -top-20 flex-1">
                      <Home />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* button fetures */}
                    <div className="h-24 flex items-center px-2 xs:px-6 justify-between">
                      <div className="flex space-x-4 items-center">
                        <button
                          className="material-symbols-outlined rounded-full bg-green-500 text-black p-3"
                          style={{
                            fontVariationSettings: '"FILL" 1, "wght" 700',
                          }}
                          onClick={playAllTracks}
                        >
                          play_arrow
                        </button>
                        {followingStatus ? (
                          <button
                            className=" text-[#dcdcdc] border rounded-full text-xs xs:text-sm px-2 xs:px-4 py-1 hover:text-white hover:scale-110 active:scale-100"
                            onClick={unFollowArtist}
                          >
                            Following
                          </button>
                        ) : (
                          <button
                            className=" text-[#dcdcdc] border rounded-full text-xs xs:text-sm px-2 xs:px-4 py-1 hover:text-white hover:scale-110 active:scale-100"
                            onClick={followArtist}
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                    {/* artist poular song and best pick */}
                    {items?.length > 0 && (
                      <div
                        className={`flex flex-wrap ${limit < 4 && "flex-col"}`}
                      >
                        {/* Popular songs */}
                        <div
                          className={`max-w-5xl px-2 xs:px-6  ${
                            limit < 4 ? "w-full" : "w-2/3"
                          }`}
                        >
                          <p
                            className={`text-lg xs:text-${
                              limit >= 2 ? 2 : ""
                            }xl font-bold mb-2`}
                          >
                            Popular
                          </p>
                          {items
                            .slice(0, showAll ? items?.length : 5)
                            .map((item: any, index: any) => (
                              <Track
                                key={index}
                                track={item}
                                index={index}
                                limit={limit}
                              />
                            ))}

                          {items?.length > 5 && !showAll && (
                            <button
                              onClick={() => {
                                setShowAll(!showAll);
                              }}
                              className="text-xs font-bold text-[#b3b3b3] hover:text-white px-2 w-fit mt-2 mb-4"
                            >
                              Show more
                            </button>
                          )}

                          {showAll && (
                            <button
                              onClick={() => {
                                setShowAll(!showAll);
                              }}
                              className="text-xs font-bold text-[#b3b3b3] hover:text-white px-2 w-fit mt-2 mb-4"
                            >
                              Show less
                            </button>
                          )}
                        </div>

                        {/* artist pick */}
                        {popularPick && (
                          <div className={`px-2 xs:px-6 max-w-md`}>
                            <p
                              className={`text-lg xs:text-${
                                limit >= 2 ? 2 : ""
                              }xl font-bold mb-2`}
                            >
                              Artist Pick
                            </p>
                            <Link
                              className="flex active:bg-[#a7a7a788] hover:bg-slate-400 hover:bg-opacity-25 px-4 py-4 rounded-lg xs:text-nowrap"
                              href={`/popularPick/${popularPick.id} `}
                            >
                              <Image
                                src={popularPick.album.images[0].url}
                                alt=""
                                height="100"
                                width="100"
                                className="rounded me-4"
                              />
                              <div className="flex flex-col">
                                <span className="flex items-center">
                                  <Image
                                    src={artist.images[0].url}
                                    alt=""
                                    height="25"
                                    width="25"
                                    className="rounded-full me-1 hidden xs:block"
                                  />
                                  <span className="text-[#b3b3b3] text-xs xs:text-sm tracking-tighter">
                                    Posted By {artist.name}
                                  </span>
                                </span>
                                <div className="font-bold my-2 text-sm xs:text-base">
                                  {popularPick.name.split(" (")[0]}
                                </div>
                                <span className="text-[#b3b3b3] text-xs xs:text-sm tracking-tighter">
                                  {popularPick.type}
                                </span>
                              </div>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* artist albums */}
                    {albums?.length > 0 && (
                      <div className="px-2 xs:px-4">
                        <RenderItems
                          items={albums}
                          name={`Featuring ${artist.name}`}
                          href={`/artist/${artist.id}/featuring`}
                        />
                      </div>
                    )}

                    {/* Related artist */}
                    {relatedArtist?.length > 0 && (
                      <div className="px-2 xs:px-4">
                        <RenderItems
                          items={relatedArtist}
                          name={`Fan Also Like`}
                          href={`/artist/${artist.id}/related`}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
}
