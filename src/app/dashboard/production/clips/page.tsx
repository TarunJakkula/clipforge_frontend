'use client';
import { fetchAllClips, fetchNoSubClips, fetchNoTranscriptClips, setActiveTab } from "@/lib/features/clips/clipsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { ZenKakuGothicAntiqueMedium } from "@/ui/fonts";
import { RefreshCwIcon } from "lucide-react";
import dynamic from "next/dynamic";

const AllClips = dynamic(() => import("./components/AllClips"));
const NoSubclips = dynamic(() => import("./components/NoSubclips"));
const NoTranscript = dynamic(() => import("./components/NoTranscript"));

export default function page() {
    const tab = useAppSelector((state: RootState) => state.clips.activeTab);
    const dispatch = useAppDispatch();
    const allClips = useAppSelector((state: RootState) => state.clips.allClips);
    const noTranscriptClips = useAppSelector((state: RootState) => state.clips.noTranscript);
    const noSubClips = useAppSelector((state: RootState) => state.clips.noSubClips);
    const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace);

    const handleRefresh = () => {
        if (tab === 1)
            dispatch(fetchNoTranscriptClips(activeSpace?.space_id ?? ''))
        if (tab === 2)
            dispatch(fetchNoSubClips(activeSpace?.space_id ?? ''))
        if (tab === 3)
            dispatch(fetchAllClips(activeSpace?.space_id ?? ''))
    }

    return (
        <div className="w-full text-neutral-50 h-full flex flex-col gap-10 px-10 py-5 bg-neutral-950 overflow-y-auto scrollbar-gutter">
            <div className="flex justify-between items-center w-full flex-wrap-reverse">
                <div className="md:block hidden" />
                <div className=" flex justify-center items-center text-neutral-50 flex-wrap">
                    <button onClick={() => dispatch(setActiveTab({ tab: 1 }))} className={`${ZenKakuGothicAntiqueMedium.className} flex gap-3 py-2 px-5 transition-all border-b-2 uppercase cursor-pointer desktop-tagline ${tab === 1 ? "  border-b-white" : " border-b-transparent"}`}>No Transcript</button>
                    <button onClick={() => dispatch(setActiveTab({ tab: 2 }))} className={`${ZenKakuGothicAntiqueMedium.className} flex gap-3 py-2 px-5 transition-all border-b-2 uppercase cursor-pointer desktop-tagline ${tab === 2 ? "  border-b-white" : " border-b-transparent"}`}>No Sub-Clips</button>
                    <button onClick={() => dispatch(setActiveTab({ tab: 3 }))} className={`${ZenKakuGothicAntiqueMedium.className} flex gap-3 py-2 px-5 transition-all border-b-2 uppercase cursor-pointer desktop-tagline ${tab === 3 ? "  border-b-white" : " border-b-transparent"}`}>All Clips </button>
                </div>
                <button onClick={handleRefresh} className="md:flex-none flex-1 flex justify-end">
                    <RefreshCwIcon className={`${(noTranscriptClips.loading || noSubClips.loading || allClips.loading) && "animate-spin"}`} />
                </button>
            </div>
            {tab === 1 && <NoTranscript />}
            {tab === 2 && <NoSubclips />}
            {tab === 3 && <AllClips />}
        </div>
    )
}
