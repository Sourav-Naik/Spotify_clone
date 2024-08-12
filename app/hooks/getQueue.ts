import axios from "axios";
import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { useSession } from "next-auth/react";
import { queueItemsState } from "../atoms/player";
import currentPlayingTrackState from "../atoms/currentPlayingTrack";

const useSpotifyQueue = () => {
  const { data: session } = useSession();
  const setQueue = useSetRecoilState(queueItemsState);
  // @ts-ignore
  const accessToken = session?.accessToken;

  const fetchQueue = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/player/queue",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const uniqueQueue = response.data.queue.reduce(
        (acc: any[], track: any) => {
          if (!acc.find((item: any) => item.id === track.id)) {
            acc.push(track);
          }
          return acc;
        },
        []
      );
      setQueue(uniqueQueue);
    } catch (err) {
      console.error("Error fetching queue:", err);
    }
  }, [session, currentPlayingTrackState]);

  return { fetchQueue };
};

export default useSpotifyQueue;
