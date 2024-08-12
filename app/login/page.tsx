"use client";
import { signIn } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8 h-screen">
      <FontAwesomeIcon icon={faSpotify} className="h-32 text-green-400" />
      <button
        className="text-3xl font-bold text-black rounded-full bg-green-400 px-8 py-2 mt-8 outline-4 outline-offset-4 outline-white hover:scale-105 active:outline"
        onClick={() => signIn("spotify", { callbackUrl: "/" })}
      >
        Login to Spotify
      </button>
    </div>
  );
}
