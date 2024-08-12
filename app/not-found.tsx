"use client";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <p>Sorry! This page could not be found.</p>
      <Link href="/" className="border rounded px-4 py-2 mt-2 hover:scale-105 active:scale-95">
        Go to home page
      </Link>
    </div>
  );
};

export default NotFoundPage;
