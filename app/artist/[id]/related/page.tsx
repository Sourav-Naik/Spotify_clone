"use client";
import { useRecoilValue } from "recoil";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import limitState from "@/app/atoms/limitState";
import useSpotify from "@/app/hooks/useSpotify";
import { useCallback, useEffect, useState } from "react";
import ContentLoader from "@/app/components/ContentLoader";
import ArtistCover from "@/app/components/Cover Components/ArtistCover";

export default function Page() {
  const params = useParams();
  const spotifyApi = useSpotify();
  const { data: session } = useSession();

  const id: any = params.id;
  const limit: number = useRecoilValue(limitState);

  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getartists = useCallback(
    (id: any) => {
      return spotifyApi.getArtistRelatedArtists(id).then(
        function (data) {
          setArtists(data.body.artists);
        },
        function (err) {
          console.error(err);
        }
      );
    },
    [spotifyApi]
  );

  const fetchDetails = useCallback(async (id: any) => {
    await getartists(id);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) {
      fetchDetails(id);
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
            Fans also like
          </div>
          <div
            className={`grid xs:px-2gap-2 xs:gap-4 ${
              gridClasses[Math.min(limit, artists.length)] || "grid-cols-12"
            }`}
          >
            {artists.map((artist, index) => (
              <div key={index}>
                <ArtistCover artist={artist} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
