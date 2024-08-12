"use client";
import { useRecoilValue } from "recoil";
import { Ids } from "@/app/Id's/ArtistId";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useSpotify from "@/app/hooks/useSpotify";
import limitState from "@/app/atoms/limitState";
import ContentLoader from "@/app/components/ContentLoader";
import ArtistCover from "@/app/components/Cover Components/ArtistCover";

export default function Page() {
  const spotifyApi = useSpotify();
  const { data: session } = useSession();

  const limit: number = useRecoilValue(limitState);

  const [loading, setLoading] = useState(true);
  const [allPopularAlbums, setAllPopularAlbums] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      spotifyApi.getArtists(Ids).then(
        function (data) {
          setAllPopularAlbums(data.body.artists);
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
            Popular artists
          </div>
          <div
            className={`xs:px-2 grid gap-2 xs:gap-4 ${
              gridClasses[Math.min(limit, allPopularAlbums.length)] ||
              "grid-cols-12"
            }`}
          >
            {allPopularAlbums.map((album, index) => (
              <div key={index}>
                <ArtistCover artist={album} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
