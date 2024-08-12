"use client";
import { RecoilRoot } from "recoil";
import ClientSessionProvider from "./ClientSessionProvider";

interface ClientSessionProviderProps {
  children: React.ReactNode;
}
export default function RecoilWrap({ children }: ClientSessionProviderProps) {
  return (
    <RecoilRoot>
      <ClientSessionProvider>{children}</ClientSessionProvider>
    </RecoilRoot>
  );
}
