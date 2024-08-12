"use client";
import { useRecoilValue } from "recoil";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import limitState from "@/app/atoms/limitState";
import useSpotify from "@/app/hooks/useSpotify";
import ContentLoader from "@/app/components/ContentLoader";
import AlbumsCover from "@/app/components/Cover Components/AlbumsCover";

export default function page() {
  const params = useParams();
  const spotifyApi = useSpotify();
  const { data: session } = useSession();

  const id: any = params.id;

  const limit: number = useRecoilValue(limitState);

  const [artist, setArtist] = useState<any>();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getAlbums = useCallback(
    (id: any) => {
      return spotifyApi.getArtistAlbums(id).then(
        function (data) {
          setAlbums(data.body?.items);
        },
        function (err) {
          console.error(err);
        }
      );
    },
    [spotifyApi]
  );

  const getArtist = useCallback(
    (id: any) => {
      return spotifyApi.getArtist(id).then(
        function (data) {
          setArtist(data?.body);
        },
        function (err) {
          console.error(err);
        }
      );
    },
    [spotifyApi]
  );

  const fetchDetails = async () => {
    await getAlbums(id);
    await getArtist(id);
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchDetails();
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
            {`Featuring ${artist?.name}`}
          </div>
          <div
            className={`grid xs:px-2 gap-2 xs:gap-4 ${
              gridClasses[Math.min(limit, albums.length)] || "grid-cols-12"
            }`}
          >
            {albums?.map((album, index) => (
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
