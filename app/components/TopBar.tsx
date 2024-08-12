import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import dp from "../Images/defaultProfilePic.jpg";
import { useSession, signOut, signIn } from "next-auth/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function TopBar() {
  const { data: session } = useSession();
  const pathName: any = usePathname();

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const style = useMemo(
    () => ({ fontVariationSettings: '"FILL" 1, "wght" 400' }),
    []
  );

  const styleClass =
    "material-symbols-outlined button text-3xl inline xs:hidden";

  return (
    <div className="sticky top-0 z-10 p-2 xs:pe-4 w-full flex justify-between xs:justify-end items-center">
      <Link
        className={`${styleClass}`}
        style={pathName === "/" ? style : {}}
        href="/"
      >
        home
      </Link>
      {/* library link */}
      <Link className={`${styleClass}`} href="/savedLibraries">
        queue_music
      </Link>
      {/* search link */}
      <Link
        className={`${styleClass}`}
        href="/search"
        style={pathName === "/search" ? style : {}}
      >
        search
      </Link>

      {/* user info */}
      {session ? (
        <div className="relative text-sm sm:text-base" ref={dropdownRef}>
          <button
            className="flex items-center rounded-full bg-[#121212]"
            onClick={toggleDropdown}
          >
            <Image
              src={session.user?.image || dp}
              alt=""
              width="200"
              height="200"
              priority={true}
              className="p-1 rounded-full object-cover w-9 h-9"
            />
            <span className="px-1 hidden xs:inline">{session.user?.name}</span>
            <span className="material-symbols-outlined text-xl pe-2">
              {dropdownVisible ? "keyboard_arrow_up" : "keyboard_arrow_down"}
            </span>
          </button>
          {dropdownVisible && (
            <div className="absolute right-0 mt-1 w-full bg-[#121212] rounded-md shadow-lg z-50 text-nowrap min-w-fit">
              <div className="py-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-white hover:bg-slate-400 hover:bg-opacity-25"
                >
                  Profile
                </Link>
                <button
                  className="block w-full text-start px-4 py-2 text-white hover:bg-slate-400 hover:bg-opacity-25"
                  onClick={() => signOut()}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          className="font-semibold rounded-full hover:scale-110 active:scale-100 bg-[black] text-white px-4 py-1"
          onClick={() => signIn("spotify", { callbackUrl: "/" })}
        >
          Sign in
        </button>
      )}
    </div>
  );
}
