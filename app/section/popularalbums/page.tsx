"use client";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Ids } from "@/app/Id's/PopularAlbumId";
import limitState from "@/app/atoms/limitState";
import useSpotify from "@/app/hooks/useSpotify";
import ContentLoader from "@/app/components/ContentLoader";
import AlbumsCover from "@/app/components/Cover Components/AlbumsCover";

export default function Page() {
  const spotifyApi = useSpotify();
  const { data: session } = useSession();

  const limit: number = useRecoilValue(limitState);

  const [loading, setLoading] = useState(true);
  const [allPopularAlbums, setAllPopularAlbums] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      spotifyApi.getAlbums(Ids).then(
        function (data) {
          setAllPopularAlbums(data.body.albums);
          setLoading(false);
        },
        function (err) {
          console.error(err);
        }
      );
    }
  }, [session]);

  const gridClasses: any = {
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
    <>
      {loading ? (
        <ContentLoader />
      ) : (
        <>
          <div className="text-2xl px-3 font-bold tracking-tight xs:pt-2">
            Popular albums
          </div>
          <div
            className={`xs:px-2 grid gap-2 xs:gap-4 ${
              gridClasses[Math.min(limit, allPopularAlbums.length)] ||
              "grid-cols-12"
            }`}
          >
            {allPopularAlbums.map((album, index) => (
              <div key={index}>
                <AlbumsCover album={album} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
