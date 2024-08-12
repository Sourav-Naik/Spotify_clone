import { atom } from "recoil";

const isPlayingState = atom({
  key: "isPlaying",
  default: false,
});

const activeDevicesState = atom({
  key: "activeDevices",
  default: false,
});

const volumeState = atom({
  key: "volume",
  default: 50,
});

const repeatModeState = atom({
  key: "repeatMode",
  default: "off",
});

const shuffleModeState = atom({
  key: "shuffleMode",
  default: false,
});

const queueItemsState = atom({
  key: "queueItems",
  default: <any>[],
});

export {
  isPlayingState,
  activeDevicesState,
  volumeState,
  repeatModeState,
  shuffleModeState,
  queueItemsState,
};
