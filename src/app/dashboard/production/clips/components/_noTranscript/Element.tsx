import React, { useState } from 'react'
import VideoPlayer from '../../../components/VideoPlayer';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { useRouter } from 'next/navigation';
import { ZenKakuGothicAntiqueRegular } from '@/ui/fonts';

import '@szhsin/react-menu/dist/index.css';
import axiosInstance from '@/util/axiosInstance';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchNoTranscriptClips } from '@/lib/features/clips/clipsSlice';
import { RootState } from '@/lib/store';

export default function Element({ obj, index }: { obj: any, index: number }) {
  const [menuState, setMenuState] = useMenuState();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    setMenuState(true)
  };

  const handleDelete = async () => {
    const loading = toast.loading("Deleting Video");
    try {
      await axiosInstance.delete("/delete_video", { params: { id: obj.clip_id, category: "clip" } });
      setTimeout(() => {
        dispatch(fetchNoTranscriptClips(activeSpace?.space_id ?? ''))
        toast.dismiss(loading);
        toast.success("Video deleted");
      },
        2000
      )
    } catch (e) {
      toast.dismiss(loading);
      toast.error("Error while deleting!");
    }
  }

  const handleAutomate = (clipId: string) => async () => {
    try {
      await axiosInstance.post("/automate_process", { space_id: activeSpace?.space_id, clip_id: clipId });
      toast.success("Automation process started");
      return router.replace("/dashboard/production");
    } catch (e) {
      toast.error("Error initiating automation");
    }
  }

  return (
    <div key={index} onContextMenu={handleContextMenu} className='w-full gap-1 flex flex-col items-center bg-transparent rounded-lg'>
      <VideoPlayer src={obj.clip_storage_link ?? ""} aspectRatio={(obj.aspect_ratio && obj.aspect_ratio === "shortform") ? '9/16' : '16/9'} />
      <span className={`${ZenKakuGothicAntiqueRegular.className} text-center line-clamp-1 mt-2 text-white desktop-tagline`}>{obj.clip_name}</span>
      <ControlledMenu
        state={menuState.state}
        anchorPoint={anchorPoint}
        onClose={() => setMenuState(false)}
      >
        <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={handleAutomate(obj.clip_id)}>Automate</MenuItem>
        <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={() => router.push(`/dashboard/production/transcript?clip_id=${obj.clip_id}`)}>Generate Transcript</MenuItem>
        <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={handleDelete}>Delete</MenuItem>
      </ControlledMenu>
    </div>
  )
}
