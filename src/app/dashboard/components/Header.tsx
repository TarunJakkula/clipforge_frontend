"use client";

import Image from "next/image";
import Profile from "./_header/Profile";
import { usePathname } from "next/navigation";
import { clipforge } from "@/ui/images";

export default function Header() {
  const pathname = usePathname();
  return (
    <header
      className={`w-full h-[72px] flex justify-between items-center md:px-10 px-5 py-4 bg-neutral-800 ${
        pathname === "/dashboard" && "hidden"
      }`}
    >
      <div className="flex gap-2 items-center">
        <Image src={clipforge} alt="" className="w-7 h-7" />
        <span className="text-white text-2xl font-bold">CLIP FORGE</span>
      </div>
      <div className="flex gap-2 items-center">
        <Profile />
      </div>
    </header>
  );
}
