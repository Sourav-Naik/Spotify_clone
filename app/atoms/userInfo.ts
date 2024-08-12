import { atom } from "recoil";

const userDetailsState = atom({
  key: "userDetails",
  default: <any>{},
});
const followedArtistState = atom({
  key: "followedArtist",
  default: <any>[],
});
const likedSongsState = atom({
  key: "likedSongs",
  default: <any>[],
});
const userPlaylistState = atom({
  key: "userPlaylist",
  default: <any>[],
});
const userAlbumState = atom({
  key: "userAlbum",
  default: <any>[],
});
const playingContextState = atom({
  key: "playingContext",
  default: "",
});

export {
  userDetailsState,
  followedArtistState,
  userPlaylistState,
  userAlbumState,
  playingContextState,
  likedSongsState,
};
