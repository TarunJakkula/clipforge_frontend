import React, { useState } from 'react'
import VideoPlayer from '../../../components/VideoPlayer';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { useRouter } from 'next/navigation';
import { ZenKakuGothicAntiqueRegular } from '@/ui/fonts';

import '@szhsin/react-menu/dist/index.css';
import axiosInstance from '@/util/axiosInstance';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { fetchNoSubClips } from '@/lib/features/clips/clipsSlice';
import toast from 'react-hot-toast';

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
                dispatch(fetchNoSubClips(activeSpace?.space_id ?? ''));
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

    const handleGenerate = (clip_id: string) => async () => {
        const loading = toast.loading("Process Started");
        try {
            await axiosInstance.post("/generate_clips", { clip_id, space_id: activeSpace?.space_id });
            toast.dismiss(loading);
            toast.success("Generating Clips");
        } catch (e) {
            toast.dismiss(loading);
            toast.error("Error genearting clips")
        }
    }

    return (
        <div key={index} title={obj.clip_name} onContextMenu={handleContextMenu} className='w-full gap-1 flex flex-col items-center bg-transparent rounded-lg'>
            <VideoPlayer src={obj.clip_storage_link ?? ""} aspectRatio={(obj.aspect_ratio && obj.aspect_ratio === "shortform") ? '9/16' : '16/9'} />
            <span className={`${ZenKakuGothicAntiqueRegular.className} text-center line-clamp-1 mt-2 transition-all text-white desktop-tagline`}>{obj.clip_name}</span>
            <ControlledMenu
                state={menuState.state}
                anchorPoint={anchorPoint}
                onClose={() => setMenuState(false)}
            >
                <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={() => router.push(`/dashboard/production/transcript?clip_id=${obj.clip_id}`)}>View Transcript</MenuItem>
                <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={handleGenerate(obj.clip_id)}>Generate Clips</MenuItem>
                <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={handleDelete}>Delete</MenuItem>
            </ControlledMenu>
        </div>
    )
}
