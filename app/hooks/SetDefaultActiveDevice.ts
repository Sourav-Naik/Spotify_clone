import { useSetRecoilState } from "recoil";
import { activeDevicesState, isPlayingState } from "../atoms/player";
import currentPlayingTrackState from "../atoms/currentPlayingTrack";

const useSetDefaultActiveDevice = (spotifyApi: any) => {
  const setIsPlaying = useSetRecoilState(isPlayingState);
  const setIsActiveDeviceSet = useSetRecoilState(activeDevicesState);
  const setCurrentPlayingTrack = useSetRecoilState(currentPlayingTrackState);

  const setDefaultActiveDevice = async () => {
    try {
      const devicesResponse = await spotifyApi.getMyDevices();
      const devices = devicesResponse.body.devices;

      if (devices.length === 0) {
        console.error("No devices found.\nOpen Spotify on your device.");
        return;
      }

      const defaultDevice =
        devices.find((device: any) => device.is_active) || devices[0];

      if (defaultDevice) {
        setIsActiveDeviceSet(true);
        await spotifyApi.transferMyPlayback([defaultDevice.id]);

        const playbackState = await spotifyApi.getMyCurrentPlaybackState();

        if (playbackState.body?.item) {
          const track: any = playbackState.body.item;
          setCurrentPlayingTrack(track);
          if (playbackState.body.is_playing) {
            await spotifyApi.play();
            setIsPlaying(true);
          } else {
            await spotifyApi.pause();
            setIsPlaying(false);
          }
        } else {
          const recentlyPlayed = await spotifyApi.getMyRecentlyPlayedTracks({
            limit: 1,
          });
          const track: any = recentlyPlayed.body.items[0]?.track;
          if (track) {
            setCurrentPlayingTrack(track);
            setIsPlaying(false);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return setDefaultActiveDevice;
};

export default useSetDefaultActiveDevice;
