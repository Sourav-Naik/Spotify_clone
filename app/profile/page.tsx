"use client";
import Link from "next/link";
import Image from "next/image";
import { useRecoilValue } from "recoil";
import Track from "../components/tracks";
import { useSession } from "next-auth/react";
import useSpotify from "../hooks/useSpotify";
import limitState from "../atoms/limitState";
import dp from "../Images/defaultProfilePic.jpg";
import GetImageColor from "../hooks/GetImageColor";
import RenderItems from "../components/renderItems";
import ContentLoader from "../components/ContentLoader";
import { useCallback, useEffect, useState } from "react";
import savedLibraries from "../Images/savedLibraries.jpg";
import likedSongsThumbnail from "../Images/likedSongs.jpg";

const Profile = () => {
  const spotifyApi = useSpotify();
  const { data: session } = useSession();

  const limit: number = useRecoilValue(limitState);

  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<any>([]);
  const [artist, setArtist] = useState<any>([]);
  const [color, setColor] = useState<string>("transparent");

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    } else {
      return num.toString();
    }
  }, []);

  useEffect(() => {
    if (session) {
      const fetchUserData = async () => {
        try {
          const userData = await spotifyApi.getMe();
          const user: any = userData.body;
          setUser(user);

          const imageUrl = user.images[1]?.url;
          if (imageUrl) {
            try {
              const color = await GetImageColor(imageUrl);
              setColor(color);
            } catch (error) {
              console.error("Error fetching image color:", error);
            }
          }

          const [topArtistsData, topTracksData] = await Promise.all([
            spotifyApi.getMyTopArtists(),
            spotifyApi.getMyTopTracks(),
          ]);

          setTracks(topTracksData.body.items);
          setArtist(topArtistsData.body.items);
        } catch (err) {
          console.error("Something went wrong!", err);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [session]);

  return (
    <>
      {loading ? (
        <ContentLoader />
      ) : (
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
                  height: (limit <= 4 ? limit * 60 : 4 * 60).toString() + "px",
                  width: (limit <= 4 ? limit * 60 : 4 * 60).toString() + "px",
                }}
              >
                <Image
                  src={user.images[1].url || dp}
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
                  {user.display_name}
                </div>
                <div
                  className={`mt-2 xs:mt-4 tracking-tight ${
                    limit <= 2 ? "text-xs" : "text-sm"
                  }`}
                >
                  {user.followers.total === 0
                    ? "No"
                    : formatNumber(user.followers.total)}{" "}
                  Followers
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full flex-1">
            <div className="absolute top-[-300px] backdrop-blur-3xl backdrop-brightness-90 w-full flex-1 normal-case pt-3 xs:px-2">
              <div className="flex flex-wrap flex-col px-2 xs:px-0 xs:flex-row max-w-fit">
                <Link
                  href={`likedSongs`}
                  className="flex items-center hover:bg-opacity-25 hover:bg-slate-400 py-2 rounded-lg ps-2 pe-4"
                >
                  <Image
                    src={likedSongsThumbnail}
                    alt=""
                    width="400"
                    height="400"
                    className="w-16 h-16 rounded"
                  />
                  <div className="ps-4">Liked Songs</div>
                </Link>
                <Link
                  href={`savedLibraries`}
                  className="flex items-center hover:bg-opacity-25 hover:bg-slate-400 py-2 rounded-lg ps-2 pe-4"
                >
                  <Image
                    src={savedLibraries}
                    alt=""
                    width="400"
                    height="400"
                    className="w-16 h-16 rounded"
                  />
                  <div className="ps-4">Saved Libraries</div>
                </Link>
              </div>

              <div className="mt-5">
                <RenderItems
                  items={artist}
                  name="Top artists this month"
                  href={"profile/topPick"}
                />
              </div>
              <div className="mt-5 xs:px-4">
                <div className="px-3 xs:px-0 xs:text-xl sm:text-2xl font-bold tracking-tight capitalize truncate">
                  Top tracks this month
                </div>
                <div className="flex bg-[#2e2e2e] px-2 mb-2 items-center sticky top-0 mt-2">
                  <div className={"xs:w-14 ps-2 pe-4 text-sm xs:text-lg"}>#</div>
                  <div className="flex-1 flex">
                    {limit >= 3 && (
                      <div className="rounded hidden sm:block mx-4 w-[50px]" />
                    )}
                    <p className="w-1/2">Title</p>
                    {limit > 3 && <p className="w-1/2">Artist</p>}
                  </div>
                  <span className="material-symbols-outlined text-xl text-center w-[74px] xs:w-24">
                    schedule
                  </span>
                </div>
                {tracks.map((track: any, index: any) => (
                  <Track
                    key={index}
                    track={track}
                    index={index}
                    limit={limit}
                    viewFormat={limit > 3 ? "List" : "Compact"}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Profile;
