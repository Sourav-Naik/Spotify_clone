"use client";
import { useSetRecoilState } from "recoil";
import { useRouter } from "next/navigation";
import { alertState } from "../atoms/alertState";
import React, { useCallback, useState } from "react";

export default function Page() {
  const router = useRouter();

  const setAlert = useSetRecoilState<any>(alertState);

  const [searchData, setSearchData] = useState<any>("");

  const handleSearch = useCallback(async () => {
    if (!searchData.trim()) {
      return setAlert({
        show: true,
        msg: "Search box is empty",
        type: "warning",
      });
    }
    router.push(`/search/${encodeURIComponent(searchData)}`);
  }, [searchData, setAlert, router]);

  return (
    <div className="flex items-center relative xs:w-fit xs:pt-12 mx-2 xs:mx-4">
      <input
        id="search"
        type="search"
        name="search"
        placeholder="Search"
        onChange={(event) => setSearchData(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && handleSearch()}
        className="bg-transparent px-3 py-2 bg-white bg-opacity-15 rounded-full w-full xs:w-96"
      />
      <button
        className="material-symbols-outlined text-white text-2xl absolute end-2 hover:scale-125 active:scale-100"
        onClick={handleSearch}
      >
        search
      </button>
    </div>
  );
}
