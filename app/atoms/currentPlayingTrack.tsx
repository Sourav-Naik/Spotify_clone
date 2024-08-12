import { atom } from "recoil";

const currentPlayingTrackState = atom({
  key: "currentPlayingTrack",
  default: null,
});

export default currentPlayingTrackState;
