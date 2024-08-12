import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import SpotifyWebApi from "spotify-web-api-node";

function useSpotify() {
  const { data: session } = useSession();

  const spotifyApi = useMemo(() => {
    return new SpotifyWebApi({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
    });
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (session && session?.accessToken) {
      // @ts-ignore
      spotifyApi.setAccessToken(session.accessToken);
    }
  }, [session, spotifyApi]);
  return spotifyApi;
}

export default useSpotify;
