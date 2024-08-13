const scopes = [
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "streaming",
  "user-top-read",
  "user-library-read",
  "user-read-private",
  "user-read-playback-state",
  "user-read-recently-played",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-follow-read",
  "user-follow-modify",
  "user-library-modify",
  "playlist-modify-public",
  "playlist-modify-private",
].join(",");

const params: any = {
  client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
  response_type: "code",
  redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
  scope: scopes,
};

const LOGIN_URL =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams(params).toString();

export default LOGIN_URL;
