"use client";
import { useRecoilValue } from "recoil";
import limitState from "@/app/atoms/limitState";
import { useEffect, useMemo, useState } from "react";
import ContentLoader from "@/app/components/ContentLoader";
import AlbumsCover from "../components/Cover Components/AlbumsCover";
import { userAlbumState, userPlaylistState } from "../atoms/userInfo";
import PlaylistCover from "@/app/components/Cover Components/PlaylistCover";

export default function SavedLibraries() {
  const limit: number = useRecoilValue(limitState);
  const userAlbums = useRecoilValue<any>(userAlbumState);
  const userPlaylist = useRecoilValue<any>(userPlaylistState);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  const gridClasses = useMemo(() => {
    const gridMap: any = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8",
      9: "grid-cols-9",
      10: "grid-cols-10",
      11: "grid-cols-11",
      12: "grid-cols-12",
    };
    return (
      gridMap[
        Math.min(limit, Math.max(userPlaylist.length, userAlbums.length))
      ] || "grid-cols-12"
    );
  }, [limit, userPlaylist.length, userAlbums.length]);

  const renderLibraries = () => (
    <>
      {userPlaylist.length > 0 && (
        <>
          <div className="text-2xl px-3 font-bold tracking-tight xs:pt-2">
            Your Libraries
          </div>
          <div className={`xs:px-2 grid gap-2 xs:gap-4 ${gridClasses}`}>
            {userPlaylist.map((album: any, index: any) => (
              <div key={index}>
                <PlaylistCover album={album} />
              </div>
            ))}
          </div>
        </>
      )}

      {userAlbums.length > 0 && (
        <>
          <div className="text-2xl px-3 font-bold tracking-tight pt-4">
            Your Albums
          </div>
          <div className={`xs:px-2 grid gap-2 xs:gap-4 ${gridClasses}`}>
            {userAlbums.map((item: any, index: any) => (
              <div key={index}>
                <AlbumsCover album={item.album} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      {loading ? (
        <ContentLoader />
      ) : userAlbums.length > 0 || userPlaylist.length > 0 ? (
        renderLibraries()
      ) : (
        <div className="text-2xl px-3 font-bold tracking-tight xs:pt-2">
          Sorry! there is no user saved library found
        </div>
      )}
    </>
  );
}
