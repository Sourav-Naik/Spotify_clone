import React from "react";
import Image from "next/image";
import dp from "@/app/Images/defaultProfilePic.jpg";

const QueueItem = (props: any) => {
  const { track } = props;
  return (
    <div className="flex p-2 mx-2 hover:bg-slate-500 hover:bg-opacity-25 rounded">
      <div className="w-10 h-10">
        <Image
          src={track?.album?.images[0]?.url || dp}
          alt=""
          width="100"
          height="100"
          className="rounded"
        />
      </div>
      <div className="flex flex-col overflow-hidden ps-2 flex-1">
        <div className="truncate">{track?.name}</div>
        <div className="text-xs truncate">
          {track?.artists?.map((artist: any, index: any) => (
            <span key={artist?.id}>
              {index > 0 && ", "}
              {artist?.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
export default QueueItem;
