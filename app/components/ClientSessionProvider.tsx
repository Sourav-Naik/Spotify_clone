"use client";
import Navbar from "./Navbar";
import TopBar from "./TopBar";
import TrackPlayer from "./TrackPlayer";
import { useSetRecoilState } from "recoil";
import limitState from "../atoms/limitState";
import { getSession, SessionProvider } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";

interface ClientSessionProviderProps {
  children: React.ReactNode;
}

export default function ClientSessionProvider({
  children,
}: ClientSessionProviderProps) {
  const [session, setSession] = useState(null);
  const [width, setWidth] = useState<number>(0);
  const setLimit = useSetRecoilState(limitState);
  const [loading, setLoading] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const getWidth = useCallback(() => {
    const width = window.innerWidth;
    if (width > 1400) return 400;
    if (width > 1200) return 360;
    if (width > 1000) return 320;
    if (width > 800) return 280;
    return 20;
  }, []);

  const getLimit = useCallback((containerWidth: number) => {
    const minColumns = 1;
    const minWidth = 130;
    const additionalColumnWidth = 170;
    if (containerWidth <= 320) return 2;
    if (containerWidth <= minWidth) return minColumns;
    return (
      minColumns +
      Math.floor((containerWidth - minWidth) / additionalColumnWidth)
    );
  }, []);

  const settingLimit = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setLimit(getLimit(containerWidth));
    }
  }, []);

  const setNavbarWidth = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      setWidth(value <= 80 ? 72 : value > 270 ? value : 280);
      settingLimit();
    },
    [settingLimit]
  );

  const collapseNavbar = useCallback(() => {
    setWidth((prevWidth) => (prevWidth > 72 ? 72 : 280));
  }, []);

  useEffect(() => {
    const handleResize = settingLimit;
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [settingLimit]);

  useEffect(() => {
    setWidth(getWidth());
    getSession()
      .then((data: any) => {
        setSession(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [getWidth]);

  return (
    <SessionProvider>
      {loading ? (
        <div className="text-white flex-1 flex justify-center items-center flex-col cursor-progress">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-white" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex flex-1 text-white xs:p-1 relative">
            {session && (
              <div className="relative h-full hidden xs:flex">
                <Navbar width={width} onClickChange={collapseNavbar} />
              </div>
            )}
            {session && (
              <input
                name="LayoutResizer"
                id="LayoutResizer_input"
                type="range"
                min="72"
                max="420"
                defaultValue={width}
                className="widthHandler hover:opacity-50 active:opacity-100 hidden xs:block"
                onChange={setNavbarWidth}
              />
            )}

            <div
              className={`relative flex flex-col flex-1 bg-gradient-to-b from-[#161616] via-[#121212] to-[#121212] xs:min-w-[420px] xs:rounded-lg cursor-default ${
                session && "xs:ms-2"
              }`}
            >
              <div className="xs:absolute end-0"> {session && <TopBar />}</div>
              <div
                id="mainPanel"
                ref={containerRef}
                className="relative flex-1 overflow-auto customScroll xs:rounded-lg"
              >
                <div className="absolute top-0 w-full h-full"> {children}</div>
              </div>
            </div>
          </div>

          {session && <TrackPlayer />}
        </div>
      )}
    </SessionProvider>
  );
}
