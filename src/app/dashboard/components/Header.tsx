"use client";

import Tabs from "./_header/Tabs";
import Profile from "./_header/Profile";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  return (
    <header
      className={`w-full h-[72px] flex justify-between items-center md:px-10 px-5 py-4 bg-neutral-800 ${
        pathname === "/dashboard" && "hidden"
      }`}
    >
      <div className="flex gap-2 justify-center items-center">
        <Tabs />
      </div>
      <div className="flex justify-center items-center">
        <Profile />
      </div>
    </header>
  );
}
