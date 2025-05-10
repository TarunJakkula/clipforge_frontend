"use client"

import { ZenKakuGothicAntiqueMedium, ZenKakuGothicAntiqueRegular } from '@/ui/fonts'
import React, { useEffect, useState } from 'react'
import Videos from './components/Videos';
import axiosInstance from '@/util/axiosInstance';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { TriangleAlertIcon } from 'lucide-react';

export type Video = {
  clip_name: string;
  clip_link: string;
  clip_id: string;
}

export default function page() {
  const [tab, setActiveTab] = useState<1 | 2>(1);
  const params = useSearchParams();
  const presetId = params.get("preset_id");
  const presets = useAppSelector((state: RootState) => state.presets.presets);
  const [shortFormVideos, setShortFormVideos] = useState<Video[]>([]);
  const [longFormVideos, setLongFormVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace);
  const router = useRouter();
  const [errorStatus, setErrorStatus] = useState(200);


  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/get_stage3_clips", { params: { preset_id: params.get("preset_id"), aspect_ratio: tab === 1 ? "shortform" : "longform" } });
      if (tab === 1) setShortFormVideos(data.data);
      if (tab === 2) setLongFormVideos(data.data);
      setLoading(false);
    } catch (e: any) {
      setErrorStatus(e.status)
      console.error(e);
      toast.error("Error fetching clips");
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!activeSpace) return router.replace("/dashboard/production");
    if (!presetId)
      notFound();
    const newPreset = presets?.find((ele) => ele.preset_id === presetId);
    if (newPreset) {
      setErrorStatus(200);
      setLongFormVideos([]);
      setShortFormVideos([]);
      fetchVideos();
    } else {
      setErrorStatus(403);
    }
  }, [tab, activeSpace, presetId, presets])

  if (loading && !presets)
    return <div className='flex justify-center items-center h-full flex-1'>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" width={80} height={80}><path fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" strokeDasharray="300 385" strokeDashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"><animate attributeName="stroke-dashoffset" calcMode="spline" dur="2" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate></path></svg>
    </div>

  if (errorStatus === 403)
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <TriangleAlertIcon className="w-[50px] h-auto aspect-square" color="#ff1234" />
        <span className={` text-white ${ZenKakuGothicAntiqueRegular.className} desktop-h6`}>
          403 Forbidden
        </span>
      </div>
    )


  return (
    <div className="w-full text-neutral-50 h-full flex flex-col gap-10 md:px-10 px-5 py-5 bg-neutral-950 overflow-y-auto scrollbar-gutter">
      <div className="flex justify-center items-center w-full">
        <div className=" flex justify-between items-center text-neutral-50 ">
          <button onClick={() => setActiveTab(1)} className={`${ZenKakuGothicAntiqueMedium.className} flex gap-3 py-2 px-5 transition-all border-b-2 uppercase cursor-pointer desktop-tagline ${tab === 1 ? "  border-b-white" : " border-b-transparent"}`}>Shortform</button>
          <button onClick={() => setActiveTab(2)} className={`${ZenKakuGothicAntiqueMedium.className} flex gap-3 py-2 px-5 transition-all border-b-2 uppercase cursor-pointer desktop-tagline ${tab === 2 ? "  border-b-white" : " border-b-transparent"}`}>Longform</button>
        </div>
      </div>

      {loading ? <div className='flex justify-center items-center h-full flex-1'>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" width={80} height={80}><path fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" strokeDasharray="300 385" strokeDashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"><animate attributeName="stroke-dashoffset" calcMode="spline" dur="2" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate></path></svg>
      </div> :
        <Videos tab={tab} videos={tab === 1 ? shortFormVideos : longFormVideos} />
      }
    </div>
  )
}
