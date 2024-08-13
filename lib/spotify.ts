const scopes = [
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "streaming",
  "user-read-private",
  "user-library-read",
  "user-top-read",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
  "user-library-modify",
  "playlist-modify-public",
  "playlist-modify-private",
].join(",");

const params: any = {
  client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
  response_type: "code",
  redirect_uri:
    "https://spotify-clone-alpha-plum.vercel.app/api/auth/callback/spotify",
  scope: scopes,
};

// Construct the authorization URL
const LOGIN_URL =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams(params).toString();

export { LOGIN_URL };
