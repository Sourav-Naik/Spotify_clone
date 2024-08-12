import Link from "next/link";
import Image from "next/image";
import { useRecoilValue } from "recoil";
import useSpotify from "../hooks/useSpotify";
import useSpotifyQueue from "../hooks/getQueue";
import React, { useCallback, useState } from "react";
import {
  likedSongsState,
  playingContextState,
  userDetailsState,
} from "../atoms/userInfo";
import likedSongsThumbnail from "../Images/likedSongs.jpg";

export default function NavbarLikedSong(props: any) {
  const { width } = props;
  const spotifyApi = useSpotify();
  const { fetchQueue: updateQueue } = useSpotifyQueue();
  
  const user = useRecoilValue(userDetailsState);
  const userSongs = useRecoilValue<any>(likedSongsState);
  const playingContext = useRecoilValue<any>(playingContextState);
  
  const [hoverState, setHoverState] = useState<boolean>(false);
  
  const playAlbum = useCallback(async () => {
    if (playingContext !== "likedSong") {
      await spotifyApi.play({
        context_uri: `spotify:user:${user.id}:collection`,
      });
      setTimeout(() => {
        updateQueue();
      }, 500);
    }
  }, [spotifyApi, playingContext]);

  return (
    <div
      className={`rounded-lg p-1 relative flex item cursor-pointer hover:bg-slate-600 hover:bg-opacity-50}`}
      onDoubleClick={playAlbum}
      onMouseEnter={() => {
        setHoverState(true);
      }}
      onMouseLeave={() => {
        setHoverState(false);
      }}
    >
      <Image
        src={likedSongsThumbnail}
        width="400"
        height="400"
        alt=""
        className={`rounded-lg w-14 h-14 ${hoverState && "opacity-40"}`}
        onClick={playAlbum}
      />
      <span
        className={`material-symbols-outlined absolute inset-4 w-fit ${
          hoverState ? "z-10 " : "hidden"
        } ${playingContext === "likedSong" ? "text-green-500" : "text-white "}`}
        onClick={playAlbum}
        style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}
      >
        {playingContext === "likedSong" ? "volume_up" : "play_arrow"}
      </span>

      {width > 270 && (
        <div className="flex-1 flex items-center truncate">
          <div className="truncate ps-2 flex-1 flex flex-col">
            <Link
              href={`/likedSongs`}
              className={`truncate hover:underline ${
                playingContext === "likedSong"
                  ? "text-green-500"
                  : "text-[#a7a7a7]"
              }`}
            >
              Liked Songs
            </Link>
            <p className="truncate text-xs capitalize text-[#a7a7a7] flex items-center">
              Playlist
              <span className="px-[2px] font-black text-xl leading-3">
                ∙
              </span>{" "}
              {userSongs?.length}
            </p>
          </div>

          {playingContext === "likedSong" && (
            <span className="material-symbols-outlined text-xl ps-1 my-auto w-fit text-green-500">
              volume_up
            </span>
          )}
        </div>
      )}
    </div>
  );
}
