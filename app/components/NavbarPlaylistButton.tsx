import Link from "next/link";
import Image from "next/image";
import { useRecoilValue } from "recoil";
import useSpotify from "../hooks/useSpotify";
import useSpotifyQueue from "../hooks/getQueue";
import React, { useCallback, useState } from "react";
import { playingContextState } from "../atoms/userInfo";

export default function NavbarPlaylistButton(props: any) {
  const { item, width } = props;
  const spotifyApi = useSpotify();
  const { fetchQueue: updateQueue } = useSpotifyQueue();

  const playingContext = useRecoilValue<any>(playingContextState);

  const [hoverState, setHoverState] = useState<boolean>(false);

  const playAlbum = useCallback(async () => {
    if (playingContext !== item?.id) {
      await spotifyApi.play({
        context_uri: `spotify:${item?.type}:${item?.id}`,
      });
      setTimeout(() => {
        updateQueue();
      }, 500);
    }
  }, [spotifyApi]);

  return (
    <div
      className="hover:bg-slate-600 hover:bg-opacity-50 rounded-lg p-1 relative flex item cursor-pointer"
      onMouseEnter={() => {
        setHoverState(true);
      }}
      onMouseLeave={() => {
        setHoverState(false);
      }}
    >
      <Image
        src={item?.images[0]?.url}
        width="400"
        height="400"
        alt=""
        className={`rounded-lg w-14 h-14 ${hoverState && "opacity-40"}`}
        onClick={playAlbum}
      />
      <span
        className={`material-symbols-outlined absolute inset-4 text-white w-fit ${
          hoverState ? "z-10 " : "hidden"
        } ${playingContext === item?.id ? "text-green-600" : "text-white"}`}
        onClick={playAlbum}
        style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}
      >
        {playingContext === item?.id ? "volume_up" : "play_arrow"}
      </span>

      {width > 270 && (
        <div className="flex-1 flex items-center truncate">
          <div className="truncate ps-2 flex-1 flex flex-col">
            <Link
              href={`/${item?.type}/${item?.id}`}
              className={`truncate hover:underline ${
                playingContext === item?.id
                  ? "text-green-500"
                  : "text-[#a7a7a7]"
              }`}
            >
              {item?.name}
            </Link>
            <p className="truncate text-xs capitalize text-[#a7a7a7]">
              {item?.type}
            </p>
          </div>

          {playingContext === item?.id && (
            <span className="material-symbols-outlined text-xl ps-1 my-auto w-fit text-green-500">
              volume_up
            </span>
          )}
        </div>
      )}
    </div>
  );
}
