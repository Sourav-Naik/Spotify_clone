import useSpotify from "./useSpotify";
import useSpotifyQueue from "./getQueue";
import { useSetRecoilState } from "recoil";
import { isPlayingState } from "../atoms/player";
import currentPlayingTrackState from "../atoms/currentPlayingTrack";

export function usePlayTrack() {
  const spotifyApi = useSpotify();
  const { fetchQueue: updateQueue } = useSpotifyQueue();

  const setIsPlaying = useSetRecoilState(isPlayingState);
  const setCurrentPlayingTrack = useSetRecoilState<any>(
    currentPlayingTrackState
  );

  const playTrack = (track: any) => {
    if (!track) return console.error("No track provided to play");

    spotifyApi
      .play({ uris: [track.uri] })
      .then(() => {
        setCurrentPlayingTrack(track);
        setIsPlaying(true);
        setTimeout(() => {
          updateQueue();
        }, 200);
      })
      .catch((err) => {
        console.error("Error playing track", err);
      });
  };

  return playTrack;
}
