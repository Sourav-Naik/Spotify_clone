import Link from "next/link";
import { useRecoilValue } from "recoil";
import limitState from "../atoms/limitState";
import React, { useEffect, useState } from "react";
import ArtistCover from "./Cover Components/ArtistCover";
import AlbumsCover from "./Cover Components/AlbumsCover";
import PlaylistCover from "./Cover Components/PlaylistCover";

export default function RenderItems(props: any) {
  const { items, name } = props;

  const limit: number = useRecoilValue(limitState);

  const [visibleItems, setVisibleItems] = useState<any[]>([]);

  useEffect(() => {
    limit <= items.length
      ? setVisibleItems(items.slice(0, limit))
      : setVisibleItems(items);
  }, [limit, items]);

  return (
    <div className="flex flex-col mb-2">
      <div className="flex justify-between items-end px-3 xs:tracking-tighter">
        {props?.href ? (
          <>
            <Link
              href={`${props.href}`}
              className="text-xl sm:text-2xl font-bold tracking-tight hover:underline underline-offset-2 decoration-[3px] capitalize overflow-hidden overflow-ellipsis whitespace-nowrap"
            >
              {name}
            </Link>
            <Link
              className="text-xs sm:text-base text-[#a7a7a7] font-bold hover:underline underline-offset-2 decoration-2 text-nowrap tracking-tighter"
              href={`${props.href}`}
            >
              Show all
            </Link>
          </>
        ) : (
          <div className="text-xl sm:text-2xl font-bold tracking-tight capitalize truncate">
            {name}
          </div>
        )}
      </div>

      <div className="grid grid-flow-col auto-cols-fr">
        {visibleItems?.map((item, index) => {
          return (
            <div key={index}>
              {item?.type === "album" ? (
                <AlbumsCover album={item} />
              ) : item?.type === "playlist" ? (
                <PlaylistCover album={item} />
              ) : item?.type === "artist" ? (
                <ArtistCover artist={item} />
              ) : (
                ""
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
