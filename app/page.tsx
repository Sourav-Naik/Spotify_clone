"use client";
import useSpotify from "./hooks/useSpotify";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import RenderItems from "./components/renderItems";
import ContentLoader from "./components/ContentLoader";
import { Ids as PopularArtistIds } from "./Id's/ArtistId";
import { Ids as PopularAlbumIds } from "./Id's/PopularAlbumId";

const Home = () => {
  const { data: session } = useSession();

  const spotifyApi = useSpotify();

  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<any[]>([]);
  const [popularAlbums, setPopAlbums] = useState<any[]>([]);
  const [popPlaylist, setPopPlaylist] = useState<any[]>([]);
  const [feturedPlaylist, setFeturedPlaylist] = useState<any[]>([]);

  const searchPlaylists = useCallback(() => {
    return spotifyApi
      .search("I-Pop", ["playlist"], {
        market: "IN",
        limit: 20,
      })
      .then((data) => {
        const playlists: any = data?.body?.playlists?.items.filter((playlist) =>
          playlist.name.toLowerCase().includes("i-pop")
        );
        setPopPlaylist(playlists);
      })
      .catch((err) => {
        console.error("Error fetching playlists:", err);
      });
  }, [spotifyApi]);

  const getFeturedPlaylist = useCallback(() => {
    return spotifyApi
      .getFeaturedPlaylists({
        country: "IN",
        locale: "en-IN",
      })
      .then(
        (data) => {
          setFeturedPlaylist(data.body?.playlists.items);
        },
        (err) => {
          console.log("Something went wrong!", err);
        }
      );
  }, [spotifyApi]);

  const searchPopularAlbum = useCallback(() => {
    return spotifyApi.getAlbums(PopularAlbumIds).then(
      (data) => {
        setPopAlbums(data.body.albums);
      },
      (err) => {
        console.error(err);
      }
    );
  }, [spotifyApi]);

  const getPopularArtists = useCallback(() => {
    return spotifyApi.getArtists(PopularArtistIds).then(
      (data) => {
        setArtists(data.body.artists);
        setLoading(false);
      },
      (err) => {
        console.error(err);
      }
    );
  }, [spotifyApi]);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    await searchPopularAlbum();
    await searchPlaylists();
    await getFeturedPlaylist();
    await getPopularArtists();

    setLoading(false);
  }, [spotifyApi]);

  useEffect(() => {
    if (session) {
      fetchDetails();
    }
  }, [session]);

  return (
    <>
      {loading ? (
        <ContentLoader />
      ) : (
        <div className="rounded-lg w-full xs:px-2 xs:pt-12">
          <RenderItems
            items={popularAlbums}
            name="popular albums"
            href={"/section/popularalbums"}
          />
          <RenderItems
            items={artists}
            name="popular artists"
            href={"/section/popularartists"}
          />
          <RenderItems
            items={feturedPlaylist}
            name="charts"
            href={"/section/charts"}
          />
          <RenderItems
            items={popPlaylist}
            name="I-Pop"
            href={"/section/I-Pop"}
          />
        </div>
      )}
    </>
  );
};
export default Home;
