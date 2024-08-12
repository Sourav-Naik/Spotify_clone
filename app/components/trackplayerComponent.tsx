import Link from "next/link";
import Image from "next/image";
import QueueItem from "./QueueItem";
import debounce from "lodash/debounce";
import useSpotify from "../hooks/useSpotify";
import useSpotifyQueue from "../hooks/getQueue";
import { useRecoilState, useRecoilValue } from "recoil";
import currentPlayingTrackState from "../atoms/currentPlayingTrack";
import React, { useMemo, useCallback, useEffect, use, useState } from "react";
import {
  isPlayingState,
  volumeState,
  repeatModeState,
  shuffleModeState,
  queueItemsState,
  activeDevicesState,
} from "../atoms/player";

export default function TrackPlayerComponent() {
  const spotifyApi = useSpotify();
  const queue = useRecoilValue<any>(queueItemsState);
  const { fetchQueue: updateQueue } = useSpotifyQueue();

  
  const activeDevice = useRecoilValue(activeDevicesState);
  const [volume, setVolume] = useRecoilState(volumeState);
  const [isPlaying, setIsPlaying] = useRecoilState<boolean>(isPlayingState);
  const [repeatMode, setRepeatMode] = useRecoilState<any>(repeatModeState);
  const [shuffleMode, setShuffleMode] = useRecoilState<any>(shuffleModeState);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useRecoilState<any>(currentPlayingTrackState);
  
  const [showQueue, setShowQueue] = useState(false);
  
  const style = useMemo(
    () => ({ fontVariationSettings: '"FILL" 1, "wght" 800' }),
    []
  );

  const debounceSetVolume = useCallback(
    debounce((volume) => {
      spotifyApi.setVolume(volume);
    }, 300),
    [spotifyApi]
  );

  const handlePlayPause = useCallback(async () => {
    try {
      const playbackState = await spotifyApi.getMyCurrentPlaybackState();
      const track = playbackState.body?.item;

      if (track) {
        setCurrentPlayingTrack(track);
        if (playbackState.body.is_playing) {
          await spotifyApi.pause();
          setIsPlaying(false);
        } else {
          await spotifyApi.play();
          setIsPlaying(true);
        }
      } else {
        const recentlyPlayed = await spotifyApi.getMyRecentlyPlayedTracks({
          limit: 1,
        });
        const newTrack = recentlyPlayed.body.items[0]?.track;

        if (newTrack) {
          setCurrentPlayingTrack(newTrack);
          await spotifyApi.play();
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error("Error toggling play/pause state or fetching tracks", err);
    }
  }, [spotifyApi]);

  const handleSkipToNext = useCallback(() => {
    spotifyApi
      .skipToNext()
      .then(() => {
        setTimeout(() => {
          spotifyApi.getMyCurrentPlaybackState().then((playbackState) => {
            setCurrentPlayingTrack(playbackState.body.item);
          });
        }, 300);
        setTimeout(() => {
          updateQueue();
        }, 600);
      })
      .catch((err) => console.error("Error skipping to next track:", err));
  }, [spotifyApi]);

  const handleSkipToPrevious = useCallback(() => {
    spotifyApi
      .skipToPrevious()
      .then(() => {
        setTimeout(() => {
          spotifyApi.getMyCurrentPlaybackState().then((playbackState) => {
            setCurrentPlayingTrack(playbackState.body.item);
          });
        }, 300);
        setTimeout(() => {
          updateQueue();
        }, 600);
      })
      .catch((err) => console.error("Error skipping to previous track:", err));
  }, [spotifyApi]);

  useEffect(() => {
    if (volume > 0 && volume < 100 && activeDevice === true) {
      debounceSetVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (activeDevice === true) {
      spotifyApi.setRepeat(repeatMode);
    }
  }, [repeatMode]);

  useEffect(() => {
    if (activeDevice === true) {
      spotifyApi.setShuffle(shuffleMode);
    }
  }, [shuffleMode]);

  return (
    currentPlayingTrack && (
      <div className="text-white relative h-22 w-full flex flex-col xs:flex-row items-center px-2 py-1">
        <div className="xs:hidden text-sm tracking-tighter flex item-center w-full pt-2 pe-2">
          <div className="truncate flex items-center h-10">
            {currentPlayingTrack.name}
          </div>
          {isPlaying && (
            <video
              src="/trackPlayingEffect.mp4"
              loop
              autoPlay
              muted
              className="h-10 w-24 object-cover"
            />
          )}
        </div>

        <div className="flex items-center justify-start xs:justify-between w-full">
          <div className="items-center pe-2 md:pe-4 min-w-0 hidden xs:flex flex-1">
            <div className="h-20 min-w-20 p-[10px]">
              <Image
                src={currentPlayingTrack.album.images[0].url}
                alt={currentPlayingTrack.name}
                width={200}
                height={200}
                className={`w-full h-full rounded-full ${
                  isPlaying && "animate-slow-spin"
                }`}
              />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <div className="text-sm truncate flex items-center">
                <Link
                  className="truncate h-10 flex items-center hover:underline"
                  href={`/track/${currentPlayingTrack.id}`}
                >
                  {currentPlayingTrack.name}
                </Link>
                {isPlaying && (
                  <video
                    src="/trackPlayingEffect.mp4"
                    loop
                    autoPlay
                    muted
                    className="h-10 w-24 object-cover"
                  />
                )}
              </div>
              <div className="text-xs truncate">
                {currentPlayingTrack.artists.map((artist: any, index: any) => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    className="hover:underline text-[#b3b3b3] hover:text-white"
                  >
                    {index > 0 && ", "}
                    {artist.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex xs:flex-1 items-center xs:justify-center">
            <button
              onClick={() => {
                shuffleMode === true
                  ? setShuffleMode(false)
                  : setShuffleMode(true);
              }}
              className={`material-symbols-outlined button pe-2 md:pe-4 ${
                shuffleMode && "text-green-500"
              }`}
            >
              shuffle
            </button>
            <button
              onClick={handleSkipToPrevious}
              className="material-symbols-outlined button"
              style={style}
            >
              skip_previous
            </button>
            <button
              className="material-symbols-outlined text-4xl sm:text-5xl hover:scale-125 active:scale-100 px-3"
              style={style}
              onClick={handlePlayPause}
            >
              {isPlaying ? "pause_circle" : "play_circle"}
            </button>
            <button
              onClick={handleSkipToNext}
              className="material-symbols-outlined button"
              style={style}
            >
              skip_next
            </button>
            <button
              onClick={() => {
                repeatMode === "off"
                  ? setRepeatMode("track")
                  : repeatMode === "track"
                  ? setRepeatMode("context")
                  : "off";
              }}
              className={`material-symbols-outlined button ps-2 md:ps-4 ${
                repeatMode !== "off" && "text-green-500"
              }`}
            >
              {repeatMode === "track" ? "repeat_one" : "repeat"}
            </button>
          </div>

          <div className="flex items-center xs:flex-1 justify-end space-x-2 ps-2">
            <button
              className={`material-symbols-outlined button ${
                showQueue && "text-green-500"
              }`}
              onClick={() => {
                setShowQueue(!showQueue);
              }}
            >
              reorder
            </button>

            <div className="flex items-center">
              <button
                className="material-symbols-outlined button"
                onClick={() => {
                  if (volume > 1) {
                    setVolume(1);
                    document.documentElement.style.setProperty(
                      "--volumeLabel",
                      "0"
                    );
                  } else {
                    setVolume(50);
                    document.documentElement.style.setProperty(
                      "--volumeLabel",
                      "50"
                    );
                  }
                }}
              >
                {volume > 1 ? "volume_up" : "volume_off"}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                className="progressBar max-w-20 volumeBar"
                onChange={(event) => {
                  setVolume(Number(event.target.value));
                  document.documentElement.style.setProperty(
                    "--volumeLabel",
                    event.target.value
                  );
                }}
              />
            </div>
          </div>
        </div>

        {showQueue && (
          <div className="absolute end-0 xs:end-1 z-50 w-full bg-black bg-opacity-70 backdrop-blur-lg bottom-[78px] xs:bottom-[88px] xs:rounded-lg xs:max-w-72">
            <button
              className={`material-symbols-outlined absolute end-1 top-1 font-bold text-2xl rounded-full leading-[24px] p-[2px] hover:text-white hover:bg-[#292929] active:bg-black`}
              onClick={() => setShowQueue(false)}
            >
              close
            </button>

            <div className="pt-2 px-2 font-extrabold">Now Playing</div>
            <QueueItem track={currentPlayingTrack} />
            <div className="px-2 pt-2 font-extrabold">Next in queue</div>

            <div className="h-96 overflow-y-auto darkScroll">
              {queue.map((item: any, index: any) => {
                return (
                  <div key={index}>
                    <QueueItem track={item} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )
  );
}
