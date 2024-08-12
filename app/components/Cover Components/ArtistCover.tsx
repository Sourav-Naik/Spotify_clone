"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import dp from "@/app/Images/defaultProfilePic.jpg";
export default function ArtistCover(props: any) {
  const artist: any = props.artist;

  return (
    <Link
      className="flex flex-col items-center relative hover:bg-[#1a1a1a] p-3 rounded h-full max-w-xs"
      href={`/artist/${artist?.id}`}
    >
      <div className="w-full aspect-w-1 aspect-h-1">
        <Image
          src={artist.images[0]?.url || dp}
          alt=""
          layout="fill"
          objectFit="cover"
          priority={true}
          className="rounded-full"
          sizes="(max-width: 600px) 100vw, 50vw"
        />
      </div>
      <div className="mt-2 text-sm tracking-tight w-full truncate">
        <span className="h-4 overflow-hidden">{artist?.name}</span>
      </div>
      <div className="text-xs text-[#b3b3b3] w-full capitalize">
        {artist?.type}
      </div>
    </Link>
  );
}
