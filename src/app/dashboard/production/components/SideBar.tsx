"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import {
  ZenKakuGothicAntiqueBold,
  ZenKakuGothicAntiqueMedium,
  ZenKakuGothicAntiqueRegular,
} from "@/ui/fonts";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  VideoIcon,
  PlayIcon,
  SpeakerLoudIcon,
  PlusIcon,
  UploadIcon,
  DashboardIcon,
  HamburgerMenuIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { usePathname, useSearchParams } from "next/navigation";
import { setModalState } from "@/lib/features/spaces/spaceSlice";
import { fetchPresets } from "@/lib/features/presets/presetSlice";
import { ChevronDown, ChevronLeft, Settings2Icon, SettingsIcon, UsersIcon } from "lucide-react";
import toast from "react-hot-toast";


export default function Sidebar() {
  const activeSpace = useAppSelector(
    (state: RootState) => state.spaces.activeSpace
  );
  const presets = useAppSelector((state: RootState) => state.presets.presets);
  const presetLoading = useAppSelector(
    (state: RootState) => state.presets.loading
  );
  const presetError = useAppSelector(
    (state: RootState) => state.presets.error
  );
  const params = useSearchParams();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const handleClick = () => dispatch(setModalState(true));

  const [showSideBar, setShowSideBar] = useState(true);

  const [accordionOpen, setAccordionOpen] = useState(false);

  useEffect(() => {
    if (presetError)
      toast.error("Error Fetching Presets")
  }, [presetError])

  useEffect(() => {
    if (activeSpace) dispatch(fetchPresets(activeSpace.space_id));
  }, [activeSpace]);

  return (
    <>
      <div
        className={`flex flex-col gap-5 p-5 h-[calc(100vh-112px)] z-40 rounded-lg shadow-md md:m-5 m-3 min-w-[300px] overflow-y-auto scrollbar-gutter bg-neutral-900 transition-all ${!showSideBar ? "-translate-x-full opacity-0 absolute left-0" : "translate-x-0 opacity-100 md:relative absolute left-0"
          }`}
      >
        <button className="flex gap-1 text-neutral-950 items-center uppercase w-fit bg-white rounded-full p-2" onClick={() => setShowSideBar(false)}><ChevronLeft color="#000" /></button>
        <button
          onClick={handleClick}
          className={`${ZenKakuGothicAntiqueRegular.className} desktop-tagline flex justify-between items-center rounded-xl px-4 py-2 w-full text-neutral-50 min-h-[54px]`}
          style={{ backgroundColor: activeSpace?.color }}
        >
          <span className="capitalize">{activeSpace?.name}</span>
          <Settings2Icon />
        </button>
        <div className="flex flex-col justify-center gap-1">
          <Link
            href="/dashboard/production"
            className={`${ZenKakuGothicAntiqueRegular.className} ${pathname === "/dashboard/production" && "bg-neutral-800"} rounded-lg desktop-tagline w-full py-2 px-2 flex items-center gap-2 text-neutral-50`}
          >
            <DashboardIcon />
            Home
          </Link>
          <Link
            href="/dashboard/production/upload"
            className={`${ZenKakuGothicAntiqueRegular.className} ${pathname.includes("/dashboard/production/upload") && "bg-neutral-800"} rounded-lg desktop-tagline w-full py-2 px-2 flex items-center gap-2 text-neutral-50`}
          >
            <UploadIcon />
            Upload
          </Link>
          <Link
            href="/dashboard/production/clips"
            className={`${ZenKakuGothicAntiqueRegular.className} ${pathname.includes("/dashboard/production/clips") && "bg-neutral-800"} rounded-lg desktop-tagline w-full py-2 px-2 flex items-center gap-2 text-neutral-50`}
          >
            <PlayIcon />
            Clips
          </Link>
          <Link
            href="/dashboard/production/prompts?step=1"
            className={`${ZenKakuGothicAntiqueRegular.className} ${pathname.includes("/dashboard/production/prompts") && "bg-neutral-800"} rounded-lg desktop-tagline w-full py-2 px-2 flex items-center gap-2 text-neutral-50`}
          >
            <FileTextIcon />
            Prompts
          </Link>
          <Link
            href="/dashboard/production/broll"
            className={`${ZenKakuGothicAntiqueRegular.className} ${pathname.includes("/dashboard/production/broll") && "bg-neutral-800"} rounded-lg desktop-tagline w-full py-2 px-2 flex items-center gap-2 text-neutral-50`}
          >
            <VideoIcon />
            Broll
          </Link>
          <Link
            href="/dashboard/production/music"
            className={`${ZenKakuGothicAntiqueRegular.className} ${pathname.includes("/dashboard/production/music") && "bg-neutral-800"} rounded-lg desktop-tagline w-full py-2 px-2 flex items-center gap-2 text-neutral-50`}
          >
            <SpeakerLoudIcon />
            Music
          </Link>
        </div>
        {/* <div className="h-[1px] bg-neutral-100 w-full" /> */}
        <div className="flex flex-col gap-3">

          <div className="flex justify-between w-full items-center gap-2 bg-white py-1 px-3 rounded-lg">
            <div className="flex w-full items-center cursor-pointer gap-1" onClick={() => setAccordionOpen(state => !state)}>
              <ChevronDown color="#000" className={`${accordionOpen && "rotate-180"} transition-all`} height={20} width={20} />
              <span
                className={`${ZenKakuGothicAntiqueBold.className} desktop-tagline select-none p-1 text-neutral-950`}
              >
                Presets
              </span>
            </div>
            <Link
              href="/dashboard/production/preset/settings"
              className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline flex justify-between items-center w-fit p-2 text-neutral-50 `}
            >
              <PlusIcon className={`${`${pathname}` === `/dashboard/production/preset/settings` ? "shadow-xl" : ""} `} color="#000" height={20} width={20} />
            </Link>
          </div>
          <div className={`flex flex-col items-center ${!accordionOpen && "hidden"} gap-1`}>
            {presetLoading ? (
              <div className="w-full h-[40px] rounded-md bg-gray-500 animate-pulse" />
            ) : (
              <>
                {!presets || presets.length === 0 ?
                  <span className={`${ZenKakuGothicAntiqueRegular.className} text-small text-neutral-50`}>{presetError ? "Error occured" : "No Presets"}</span>
                  :
                  presets?.map((obj, index) => {
                    return (
                      <div
                        key={index}
                        className={`${ZenKakuGothicAntiqueRegular.className} p-1 px-3 ${`${pathname}?preset_id=${params.get("preset_id")}` === `/dashboard/production/preset?preset_id=${obj.preset_id}` ? "bg-neutral-800 rounded-lg " : ""} desktop-tagline w-full flex items-center justify-between gap-2 text-neutral-50`}
                      >
                        <Link href={{
                          pathname: `/dashboard/production/preset`,
                          query: { preset_id: obj.preset_id },
                        }} className="flex items-center gap-2 flex-1">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: obj.color + "" }}
                          />
                          {obj.name}
                        </Link>
                        {obj.isOwner ? <Link href={{
                          pathname: `/dashboard/production/preset/settings`,
                          query: { preset_id: obj.preset_id },
                        }} className={`${`${pathname}?preset_id=${params.get("preset_id")}` === `/dashboard/production/preset/settings?preset_id=${obj.preset_id}` ? "bg-neutral-800 rounded-lg " : ""} p-2`}><SettingsIcon className="w-5 h-5" color="#fff" /></Link>
                          : <UsersIcon className='text-white m-1 p-1' />}
                      </div>
                    );
                  })
                }

              </>
            )}
          </div>
        </div>
      </div>
      <button className={`flex gap-1 z-50 text-neutral-950 items-center uppercase h-fit py-4 px-2 absolute bottom-5 rounded-r-2xl left-0 bg-white ${showSideBar && "hidden"}`} onClick={() => setShowSideBar(true)}><HamburgerMenuIcon className="rotate-90" /></button>
    </>
  );
}
