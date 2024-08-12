import Link from "next/link";
import Image from "next/image";
import useSpotify from "@/app/hooks/useSpotify";
import useSpotifyQueue from "@/app/hooks/getQueue";
import dp from "@/app/Images/defaultProfilePic.jpg";
import React, { useCallback, useState } from "react";

export default function AlbumsCover(props: any) {
  const album: any = props.album;

  const spotifyApi = useSpotify();
  const { fetchQueue: updateQueue } = useSpotifyQueue();

  const [hover, setHover] = useState(false);

  const playAlbum = useCallback(async () => {
    await spotifyApi.play({
      context_uri: `spotify:album:${album.id}`,
    });

    setTimeout(() => {
      updateQueue();
    }, 500);
  }, [spotifyApi]);

  return (
    <div
      className={`flex flex-col items-center p-3 rounded relative max-w-xs ${
        hover && "bg-slate-500 bg-opacity-25"
      }`}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <Link
        className="w-full aspect-w-1 aspect-h-1"
        href={`/album/${album.id}`}
      >
        <Image
          src={album.images[0].url || dp}
          alt={album.name}
          layout="fill"
          objectFit="cover"
          priority={true}
          className={`rounded ${hover && "opacity-70"}`}
          sizes={`(max-width: 600px) 100vw, 50vw `}
        />
      </Link>
      <div className="mt-2 text-sm tracking-tight w-full truncate">
        <Link
          href={`/album/${album?.id}`}
          className="h-4 overflow-hidden w-full"
        >
          {album?.name}
        </Link>
      </div>
      <div className=" w-full truncate text-xs text-[#b3b3b3]">
        {album?.artists.map((artist: any, index: number) => (
          <span key={artist.id}>
            <Link href={`/artist/${artist.id}`} className="hover:underline">
              {artist.name}
            </Link>
            {index < album.artists.length - 1 && <span>, </span>}
          </span>
        ))}
      </div>
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
