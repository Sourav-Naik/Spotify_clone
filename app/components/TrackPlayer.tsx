import Alert from "./alertComponent";
import { useSession } from "next-auth/react";
import useSpotify from "../hooks/useSpotify";
import useSpotifyQueue from "../hooks/getQueue";
import { useEffect, useState, useCallback } from "react";
import TrackPlayerComponent from "./trackplayerComponent";
import currentPlayingTrackState from "../atoms/currentPlayingTrack";
import { activeDevicesState, isPlayingState } from "../atoms/player";
import useSetDefaultActiveDevice from "../hooks/SetDefaultActiveDevice";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  likedSongsState,
  playingContextState,
  userAlbumState,
  userDetailsState,
  userPlaylistState,
} from "../atoms/userInfo";

export default function TrackPlayer() {
  const spotifyApi = useSpotify();
  const { data: session } = useSession();
  const { fetchQueue } = useSpotifyQueue();

  const setIsPlaying = useSetRecoilState(isPlayingState);
  const setUserDetails = useSetRecoilState(userDetailsState);
  const setUserAlbum = useSetRecoilState<any>(userAlbumState);
  const isActiveDeviceSet = useRecoilValue(activeDevicesState);
  const setUserSongs = useSetRecoilState<any>(likedSongsState);
  const setUserPlaylist = useSetRecoilState<any>(userPlaylistState);
  const setDefaultActiveDevice = useSetDefaultActiveDevice(spotifyApi);
  const setPlayingContext = useSetRecoilState<any>(playingContextState);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useRecoilState<any>(currentPlayingTrackState);

  const [playingAd, setPlayingAd] = useState(false);

  const fetchUser = useCallback(() => {
    return spotifyApi.getMe().then(
      function (data) {
        setUserDetails(data.body);
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }, [session, spotifyApi]);

  const fetchPlaybackState = useCallback(async () => {
    const data = await spotifyApi.getMyCurrentPlaybackState();
    if (data.body?.context) {
      const contextUri = data.body.context.uri;
      const id = contextUri.split(":")[2];
      setPlayingContext(id);
      const href = data.body.context.href;
      if (href === "https://api.spotify.com/v1/me/tracks") {
        setPlayingContext("likedSong");
      }
    } else {
      setPlayingContext(null);
    }

    if (data.body?.currently_playing_type === "ad") {
      setPlayingAd(true);
      return;
    }

    if (data.body?.item) {
      setPlayingAd(false);
      const track = data.body.item;
      const playing = data.body.is_playing;
      setIsPlaying(playing);
      if (track.id !== currentPlayingTrack?.id) {
        setCurrentPlayingTrack(track);
      }
    }
  }, [session, spotifyApi, currentPlayingTrack]);

  useEffect(() => {
    if (session) {
      fetchUser();
      !isActiveDeviceSet && setDefaultActiveDevice();
    }
  }, [session, isActiveDeviceSet]);

  useEffect(() => {
    if (isActiveDeviceSet) {
      fetchQueue();
      const intervalId = setInterval(fetchPlaybackState, 2000);
      return () => clearInterval(intervalId);
    }
  }, [session, currentPlayingTrack, isActiveDeviceSet]);

  useEffect(() => {
    if (session) {
      spotifyApi
        .getUserPlaylists()
        .then((data) => setUserPlaylist(data.body.items))
        .catch((error) =>
          console.error("Error fetching user playlists:", error)
        );

      spotifyApi
        .getMySavedAlbums()
        .then((data) => setUserAlbum(data.body.items))
        .catch((error) =>
          console.error("Error fetching user saved albums:", error)
        );

      spotifyApi.getMySavedTracks().then(
        function (data) {
          setUserSongs(data.body.items);
        },
        function (err) {
          console.error("Error fetching user saved songs:", err);
        }
      );
    }
  }, [session, spotifyApi]);

  return (
    <>
      <Alert />
      {isActiveDeviceSet === true ? (
        playingAd ? (
          <div className="text-sm xs:text-base text-white bg-red-600 text-center font-bold">
            Playing Ad ! Please Wait
          </div>
        ) : (
          <TrackPlayerComponent />
        )
      ) : (
        <div className="text-sm xs:text-base text-white bg-red-600 text-center font-bold">
          No Device Found! Open Spotify App.
        </div>
      )}
    </>
  );
}
