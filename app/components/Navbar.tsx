import Link from "next/link";
import { useRecoilValue } from "recoil";
import { usePathname } from "next/navigation";
import NavbarLikedSong from "./NavbarLikedSong";
import { useEffect, useMemo, useState } from "react";
import NavbarPlaylistButton from "./NavbarPlaylistButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  likedSongsState,
  userAlbumState,
  userPlaylistState,
} from "../atoms/userInfo";
import {
  faSpotify,
  faXTwitter,
  faInstagram,
  faFacebookF,
} from "@fortawesome/free-brands-svg-icons";

export default function Navbar(props: any) {
  let barWidth: number = props.width;
  const pathName = usePathname();

  const userAlbums = useRecoilValue<any>(userAlbumState);
  const userSongs = useRecoilValue<any>(likedSongsState);
  const userPlaylist = useRecoilValue<any>(userPlaylistState);

  const [libraryPopup, setLibraryPopup] = useState(false);
  const [showPlaylistSection, setShowPlaylistSection] =
    useState<boolean>(false);

  let hoverTimeout: NodeJS.Timeout | null = null;

  const libraryMouseEnter = () => {
    hoverTimeout = setTimeout(() => {
      setLibraryPopup(true);
    }, 500);
  };

  const libraryMouseLeave = () => {
    setLibraryPopup(false);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
  };

  const styleClasses = "material-symbols-outlined hover:text-white";

  const style = useMemo(
    () => ({ fontVariationSettings: '"FILL" 1, "wght" 800', color: "white" }),
    []
  );

  useEffect(() => {
    setLibraryPopup(false);
    if (
      userAlbums.length > 0 ||
      userPlaylist.length > 0 ||
      userSongs.length > 0
    ) {
      setShowPlaylistSection(true);
    }
  }, [barWidth, userPlaylist, userAlbums]);

  return (
    <>
      {barWidth <= 100 ? (
        <div
          className="bg-[#121212] rounded-lg py-5 h-full flex flex-col text-center justify-between text-[#a7a7a7]"
          style={{ width: 72, zIndex: "1" }}
        >
          <div className="flex flex-col items-center space-y-4 w-full ">
            <Link href="/">
              <FontAwesomeIcon icon={faSpotify} className="h-8 text-white" />
            </Link>
            <Link
              className={`${styleClasses}`}
              href="/"
              style={pathName === "/" ? style : {}}
            >
              home
            </Link>
            <Link
              className={`${styleClasses} scale-95`}
              href="/search"
              style={pathName === "/search" ? style : {}}
            >
              search
            </Link>
            {/* library button */}
            <div className="relative w-full">
              <button
                className={`${styleClasses}`}
                onClick={props.onClickChange}
                onMouseEnter={libraryMouseEnter}
                onMouseLeave={libraryMouseLeave}
              >
                queue_music
              </button>
              {libraryPopup && (
                <div className="absolute text-nowrap rounded bg-[#353535] text-white overflow-visible bottom-10 right-0 left-0 px-2 py-1 text-sm">
                  Expand
                </div>
              )}
            </div>
            {showPlaylistSection && (
              <div className=" flex flex-col max-h-[50vh] min-h-10 overflow-y-scroll hiddenScroll">
                {userSongs.length > 0 && <NavbarLikedSong width={barWidth} />}
                {userPlaylist.length > 0 &&
                  userPlaylist.map((item: any) => {
                    return (
                      <NavbarPlaylistButton
                        item={item}
                        width={barWidth}
                        key={item.id}
                      />
                    );
                  })}
                {userAlbums.map((item: any) => (
                  <NavbarPlaylistButton
                    key={item.album.id}
                    item={item.album}
                    width={barWidth}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Link
              href="https://www.facebook.com/Spotify"
              target="blank"
              className="hover:text-white hover:bg-[#292929] active:bg-black p-1 px-[9px] rounded-full leading-5"
            >
              <FontAwesomeIcon icon={faFacebookF} className="h-5" />
            </Link>
            <Link
              href="https://www.instagram.com/spotify/"
              target="blank"
              className="hover:text-white hover:bg-[#292929] active:bg-black p-1 px-[6px] rounded-full leading-5"
            >
              <FontAwesomeIcon icon={faInstagram} className="h-6" />
            </Link>
            <Link
              href="https://x.com/spotify"
              target="blank"
              className="hover:text-white hover:bg-[#292929] active:bg-black p-1 px-[5px] rounded-full leading-5"
            >
              <FontAwesomeIcon icon={faXTwitter} className="h-[22px]" />
            </Link>
          </div>
        </div>
      ) : (
        <div
          className="relative flex flex-col flex-1 text-[#a7a7a7] text-sm"
          style={{ width: barWidth, zIndex: 1 }}
        >
          {/* Top Panel */}
          <div className="bg-[#121212] rounded-lg p-5 font-semibold mb-1">
            {/* Logo */}
            <Link
              href="/"
              className={`flex items-end space-x-1 text-white ${
                pathName !== "/" && "active:opacity-50"
              }`}
            >
              <FontAwesomeIcon icon={faSpotify} className="h-8" />
              <span className="tracking-tight text-3xl leading-7 font-bold ps-2">
                Spotify
              </span>
            </Link>

            {/* Home Button */}
            <Link className="flex items-end my-3" href="/">
              <span
                className="material-symbols-outlined"
                style={pathName === "/" ? style : {}}
              >
                home
              </span>
              <span
                className="ms-4 text-xl leading-6"
                style={pathName === "/" ? style : {}}
              >
                Home
              </span>
            </Link>

            {/* Search Button */}
            <Link
              className="flex items-end hover:text-white active:opacity-50"
              href="/search"
            >
              <span
                className="material-symbols-outlined scale-95"
                style={pathName === "/search" ? style : {}}
              >
                search
              </span>
              <span
                className="ms-4 text-xl leading-[26px]"
                style={pathName === "/search" ? style : {}}
              >
                Search
              </span>
            </Link>
          </div>

          {/* Library */}
          <div className="bg-[#121212] rounded-t-lg flex items-center justify-between px-5 p-2 relative">
            <button
              className="flex items-center font-semibold hover:text-white text-xl active:opacity-50"
              onClick={props.onClickChange}
              onMouseEnter={libraryMouseEnter}
              onMouseLeave={libraryMouseLeave}
            >
              <span className="material-symbols-outlined me-2">
                queue_music
              </span>
              Your Library
            </button>
            {libraryPopup && (
              <div className="absolute text-nowrap rounded-lg bg-[#353535] text-white p-2 bottom-10 start-20">
                Collapse Your Library
              </div>
            )}
          </div>

          {/* Scroll Panel */}
          <div className="bg-[#121212] flex py-4 px-3 text-white flex-1">
            {showPlaylistSection && (
              <div className="p-4 rounded bg-[#242424] mb-2 darkScroll flex-1 max-h-[50vh] min-h-10 overflow-auto">
                {userSongs.length > 0 && <NavbarLikedSong width={barWidth} />}
                {userPlaylist.length > 0 &&
                  userPlaylist.map((item: any, index: any) => (
                    <NavbarPlaylistButton
                      key={index}
                      item={item}
                      width={barWidth}
                    />
                  ))}
                {userAlbums.length > 0 &&
                  userAlbums.map((item: any) => (
                    <NavbarPlaylistButton
                      key={item.album.id}
                      item={item.album}
                      width={barWidth}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="bg-[#121212] rounded-b-lg text-white p-4 flex items-center justify-end space-x-2">
            <Link
              href="https://www.facebook.com/Spotify"
              target="_blank"
              className="hover:text-white hover:bg-[#292929] active:bg-black p-1 px-[9px] rounded-full leading-5"
            >
              <FontAwesomeIcon icon={faFacebookF} className="h-5" />
            </Link>
            <Link
              href="https://www.instagram.com/spotify/"
              target="_blank"
              className="hover:text-white hover:bg-[#292929] active:bg-black p-1 px-[6px] rounded-full leading-5"
            >
              <FontAwesomeIcon icon={faInstagram} className="h-6" />
            </Link>
            <Link
              href="https://x.com/spotify"
              target="_blank"
              className="hover:text-white hover:bg-[#292929] active:bg-black p-1 px-[5px] rounded-full leading-5"
            >
              <FontAwesomeIcon icon={faXTwitter} className="h-[22px]" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
