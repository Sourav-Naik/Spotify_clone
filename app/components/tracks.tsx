import Link from "next/link";
import Image from "next/image";
import { useSetRecoilState } from "recoil";
import useSpotify from "../hooks/useSpotify";
import useSpotifyQueue from "../hooks/getQueue";
import { alertState } from "../atoms/alertState";
import { usePlayTrack } from "../hooks/playTrack";
import { likedSongsState } from "../atoms/userInfo";
import dp from "@/app/Images/defaultProfilePic.jpg";
import React, { useCallback, useState } from "react";

export default function Track(props: any) {
  const { track, index, viewFormat, limit, deletePermission } = props;

  const playTrack = usePlayTrack();
  const spotifyApi = useSpotify();
  const { fetchQueue: updateQueue } = useSpotifyQueue();

  const setAlert = useSetRecoilState<any>(alertState);
  const setUserSongs = useSetRecoilState<any>(likedSongsState);

  const [hover, setHover] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [addButtonPopUp, setAddButtonPopUp] = useState(false);

  const minutes = Math.floor(track?.duration_ms / 60000);
  const seconds = parseInt(((track?.duration_ms % 60000) / 1000).toFixed(0));

  let hoverTimeout: NodeJS.Timeout | null = null;

  const deleteTrack = useCallback(() => {
    spotifyApi.removeFromMySavedTracks([track?.id]).then(
      function () {
        setIsDeleted(true);
        setAlert({ show: true, msg: "Track Removed", type: "warning" });
        setTimeout(() => {
          spotifyApi.getMySavedTracks().then(
            function (data) {
              setUserSongs(data.body.items);
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

  const addButtonEnter = () => {
    hoverTimeout = setTimeout(() => {
      setAddButtonPopUp(true);
    }, 500);
  };

  const addButtonLeave = () => {
    setAddButtonPopUp(false);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
  };

  const addToQueue = useCallback(
    async (trackUri: any) => {
      await spotifyApi.addToQueue(trackUri);
      setTimeout(() => {
        updateQueue();
      }, 200);
    },
    [spotifyApi]
  );

  if (isDeleted || track?.name === "") {
    return null;
  }

  return (
    <div
      key={track?.id}
      className="w-full flex p-2 items-center rounded text-[#b3b3b3] active:bg-[#a7a7a788] hover:bg-slate-400 hover:bg-opacity-25 hover:text-white cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDoubleClick={() => playTrack(track)}
    >
      {/* index number */}
      <button
        onClick={() => {
          playTrack(track);
        }}
        className={`xs:w-14 pe-4 ${
          hover
            ? "material-symbols-outlined text-lg xs:text-2xl"
            : "ps-2 text-sm xs:text-lg"
        }`}
        style={{
          fontVariationSettings: '"FILL" 1',
        }}
      >
        {hover ? "play_arrow" : index + 1}
      </button>

      {limit >= 3 && (
        <Image
          src={track?.album?.images[0]?.url || dp}
          alt=""
          width={50}
          height={50}
          priority={true}
          className="rounded hidden sm:block mx-4"
        />
      )}

      {/* title */}
      {viewFormat === "Compact" ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* title with Compact format */}
          <div className="flex-1 truncate">
            <Link
              className="text-white hover:underline text-sm xs:text-base"
              href={`/track/${track?.id}`}
            >
              {track?.name}
            </Link>
          </div>
          <div className="text-sm text-nowrap truncate">
            {track?.artists.map((artist: any, index: number) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="hover:underline"
              >
                {index > 0 && ", "}
                {artist.name}
              </Link>
            ))}
          </div>
        </div>
      ) : viewFormat === "List" ? (
        <>
          {/* title with List format */}
          <div className="flex-1 truncate ">
            <Link
              className="text-white hover:underline text-sm xs:text-base"
              href={`/track/${track?.id}`}
            >
              {track?.name}
            </Link>
          </div>
          <div className="text-sm text-wrap flex-1 px-4">
            {track?.artists.map((artist: any, index: number) => (
              <Link key={artist.id} href={`/artist/${artist.id}`}>
                {index > 0 && <span>, </span>}
                <span className="hover:underline">{artist.name}</span>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className=" flex-1 truncate">
          <Link
            className="text-white hover:underline text-sm xs:text-base"
            href={`/track/${track?.id}`}
          >
            {track?.name}
          </Link>
        </div>
      )}

      {/* duration and extra button */}
      <div className="flex items-center justify-between text-center">
        <div className="relative">
          <button
            onClick={() => {
              addToQueue(track?.uri);
            }}
            className="material-symbols-outlined text-lg xs:text-2xl text-[#b3b3b3] hover:text-white w-6 xs:w-8"
            onMouseEnter={addButtonEnter}
            onMouseLeave={addButtonLeave}
          >
            {hover ? "add_circle" : ""}
          </button>
          {addButtonPopUp && (
            <div className="absolute text-nowrap text-xs bottom-8 tracking-tighter -translate-x-1/4">
              Add To Queue
            </div>
          )}
        </div>

        <div className="text-xs xs:text-sm text-center text-[#b3b3b3] xs:w-16">{`${minutes}:${
          seconds < 10 ? "0" : ""
        }${seconds}`}</div>

        <div className="w-6 xs:w-8">
          {deletePermission && (
            <div
              className="material-symbols-outlined text-lg xs:text-2xl text-[#b3b3b3] hover:text-red-500 hover:scale-125 active:scale-100"
              onClick={deleteTrack}
            >
              delete
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
