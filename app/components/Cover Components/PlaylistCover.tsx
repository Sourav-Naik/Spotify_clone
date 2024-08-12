import Link from "next/link";
import Image from "next/image";
import dp from "@/app/Images/defaultProfilePic.jpg";
import useSpotify from "@/app/hooks/useSpotify";
import useSpotifyQueue from "@/app/hooks/getQueue";
import React, { useCallback, useState } from "react";

export default function PlaylistCover(props: any) {
  const playlist: any = props.album;
  const [hover, setHover] = useState(false);

  const spotifyApi = useSpotify();
  const { fetchQueue: updateQueue } = useSpotifyQueue();

  const playAlbum = useCallback(async () => {
    await spotifyApi.play({
      context_uri: `spotify:playlist:${playlist?.id}`,
    });

    setTimeout(() => {
      updateQueue();
    }, 500);
  }, [spotifyApi]);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <Link
        href={`/playlist/${playlist?.id}`}
        className={`flex flex-col items-center p-3 rounded max-w-xs${
          hover && "bg-slate-500 bg-opacity-25"
        }`}
      >
        <div className="w-full aspect-w-1 aspect-h-1">
          <Image
            src={playlist?.images[0].url || dp}
            alt=""
            layout="fill"
            objectFit="cover"
            priority={true}
            className={`rounded ${hover && "opacity-70"}`}
            sizes="(max-width: 600px) 100vw, 50vw"
          />
        </div>
        <div className="mt-2 text-sm tracking-tight w-full truncate">
          <span className="h-4 overflow-hidden">{playlist?.name}</span>
        </div>
        <div className="truncate w-full  text-xs text-[#b3b3b3]">
          {playlist?.description}
        </div>
      </Link>
      {hover && (
        <button
          onClick={playAlbum}
          className="material-symbols-outlined rounded-full bg-green-500 text-black p-3 absolute end-4 bottom-16 z-10"
          style={{
            fontVariationSettings: '"FILL" 1, "wght" 700',
          }}
        >
          play_arrow
        </button>
      )}
    </div>
  );
}
