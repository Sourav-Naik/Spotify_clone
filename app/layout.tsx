import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./Css/globalIcon.css";
import "./Css/globals.css";
import RecoilWrap from "./components/RecoilWrap";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotify Clone",
  description: "Made by Sourav",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black h-screen flex customScroll`}>
        <RecoilWrap>{children}</RecoilWrap>
      </body>
    </html>
  );
}
