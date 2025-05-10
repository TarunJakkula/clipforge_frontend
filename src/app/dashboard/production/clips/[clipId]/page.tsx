'use client'
import { ZenKakuGothicAntiqueBold, ZenKakuGothicAntiqueMedium, ZenKakuGothicAntiqueRegular } from '@/ui/fonts';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import VideoPlayer from '../../components/VideoPlayer';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import axiosInstance from '@/util/axiosInstance';
import toast from 'react-hot-toast';
import Loading from '../components/_loading/Loading';
import FolderElement from "../components/_allClips/FolderElement"
import VideoElement from "../components/_allClips/VideoElement"
import { RefreshCwIcon, TriangleAlertIcon } from 'lucide-react';


type ClipProps = {
    clip_id: string;
    clip_name: string;
    clip_link: string;
    remixed: boolean;
    aspect_ratio: "shortform" | "longform"
}

type MainVideoDataProps = {
    clip_name: string;
    clip_link: string;
    clip_id: string;
    aspect_ratio: "shortform" | "longform",
}

export default function page() {
    const { clipId } = useParams();
    const params = useSearchParams();
    const router = useRouter();
    const activeSpace = useAppSelector(
        (state: RootState) => state.spaces.activeSpace
    );
    const [mainVideoData, setMainVideoData] = useState<MainVideoDataProps | null>(null)
    const [loading, setLoading] = useState(true);
    const updatedBreadCrumbs = useRef(false);
    const [tab, setTab] = useState<1 | 2>(1);
    const [clips, setClips] = useState<ClipProps[]>([]);
    const [folderClips, setFolderClips] = useState<ClipProps[]>([]);
    const [errorStatus, setErrorStatus] = useState(200);
    const [disableButton, setDisableButton] = useState(false);

    const checkAll = () => {
        const stage = params.get("stage");
        if (!stage)
            notFound();
        if (stage !== "1" && stage !== "2")
            notFound();
        return stage;
    }

    const fetchclips = async () => {
        const stage = checkAll();
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/get_stage${stage}_clips`, { params: { clip_id: clipId, space_id: activeSpace?.space_id } });
            setMainVideoData({ clip_name: data.clip_name, clip_link: data.clip_link, clip_id: data.clip_id, aspect_ratio: data.aspect_ratio });
            if (data.clips_info)
                setClips(data.clips_info);
            if (data.folder_info)
                setFolderClips(data.folder_info)
            if (!updatedBreadCrumbs.current) {
                updatedBreadCrumbs.current = true;
            }
            setErrorStatus(200);
        } catch (e: any) {
            setErrorStatus(e.status);
            toast.error('Error loading data');
            console.error(e)
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!activeSpace) return router.replace("/dashboard/production");
        if (!clipId)
            notFound();
        fetchclips();
    }, [activeSpace])


    const handleRemixAll = async () => {
        setDisableButton(true);
        try {
            toast.loading("Process Started", { duration: 3000 });
            await axiosInstance.post("/generate_remixed_clips", { clip_id: clipId, space_id: activeSpace?.space_id })
            toast.success("Remixing Started");
        } catch (e) {
            toast.error("Error Occured! Try again later")
        } finally {
            setDisableButton(false);
        }
    }

    const handleApplyPresets = async () => {
        const toastLoading = toast.loading("Applying presets");
        setDisableButton(true);
        try {
            await axiosInstance.post("/stage_three", { space_id: activeSpace?.space_id, subclip_id: clipId });
            toast.dismiss(toastLoading);
            toast.success("Process Started");
        } catch (e) {
            toast.dismiss(toastLoading);
            toast.error("Error applying to presets");
        } finally {
            setDisableButton(false);
        }
    }

    if (loading)
        return <div className='w-full h-[calc(100vh-72px)] text-neutral-50 flex flex-col gap-10 p-10 bg-neutral-950 overflow-y-auto'>
            <div className='w-full flex justify-center items-center'>
                <div className='flex flex-col w-full gap-5 items-center'>
                    <Loading height={350} />
                </div>
            </div>
            <div className='flex flex-col w-full gap-10'>
                <div className='grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5'>
                    <Loading height={80} />
                    <Loading height={80} />
                    <Loading height={80} />
                    <Loading height={80} />
                </div>
            </div>
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
        <div className='w-full h-[calc(100vh-72px)] text-neutral-50 flex flex-col gap-10 p-10 bg-neutral-950 overflow-y-auto'>
            <div className='w-full flex justify-center items-center'>
                <div className='flex flex-col w-full gap-5 items-center'>
                    {loading ? <Loading height={350} /> : <>
                        {mainVideoData && <div className={` ${mainVideoData.aspect_ratio === "longform" ? "w-1/2" : "w-[250px]"}`}><VideoPlayer src={mainVideoData.clip_link} aspectRatio={(mainVideoData.aspect_ratio === "shortform") ? '9/16' : '16/9'} /></div>}
                        <span title={mainVideoData?.clip_name} className={`${ZenKakuGothicAntiqueBold.className} desktop-h6 uppercase text-center line-clamp-1`}>{mainVideoData?.clip_name ?? "Video Not Found"}</span></>
                    }
                </div>
            </div>
            <div className='flex flex-col w-full gap-10'>
                {!loading &&
                    <div className={`flex ${params.get("stage") === "1" ? "justify-between" : "justify-end"} items-center gap-2`}>
                        {params.get("stage") === "1" && <div className=" flex justify-center items-center text-neutral-50 ">
                            <button onClick={() => setTab(1)} className={`${ZenKakuGothicAntiqueMedium.className} flex gap-3 py-2 px-5 transition-all border-b-2 uppercase cursor-pointer desktop-tagline ${tab === 1 ? "  border-b-white" : " border-b-transparent"}`}>Sub Clips</button>
                            <button onClick={() => setTab(2)} className={`${ZenKakuGothicAntiqueMedium.className} flex gap-3 py-2 px-5 transition-all border-b-2 uppercase cursor-pointer desktop-tagline ${tab === 2 ? "  border-b-white" : " border-b-transparent"}`}>Remixed Clips</button>
                        </div>}
                        {<div className=' flex justify-end items-center gap-3'>
                            {(tab === 1 && clips.length !== 0) && <button onClick={params.get("stage") === "1" ? handleRemixAll : handleApplyPresets} disabled={disableButton} className='bg-blue-600 hover:scale-90 transition-all rounded-full disabled:bg-gray-500 text-neutral-50 desktop-tagline px-4 py-2'>{params.get("stage") === "1" ? "Remix all clips" : "Apply all to presets"}</button>}
                            <button onClick={fetchclips} className='bg-neutral-900 hover:scale-90 transition-all rounded-full disabled:bg-gray-500 text-neutral-50 desktop-tagline px-3 py-3'>
                                <RefreshCwIcon width={15} height={15} />
                            </button>
                        </div>}
                    </div>
                }
                {loading ?
                    <div className='grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5'>
                        <Loading height={80} />
                        <Loading height={80} />
                        <Loading height={80} />
                        <Loading height={80} />
                    </div>
                    : <>
                        {tab === 1 && (clips.length !== 0 ?
                            <div className={`grid  ${mainVideoData?.aspect_ratio === "longform" ? "grid-cols-[repeat(auto-fill,minmax(250px,1fr))]" : "grid-cols-[repeat(auto-fill,minmax(150px,1fr))]"} gap-5`}>
                                {clips.map((obj, index) => <VideoElement key={obj.clip_id} parentId={mainVideoData?.clip_id} obj={obj} index={index} showRemixButton={params.get("stage") === "1"} category={params.get("stage") === "1" ? "subclip" : "remixclip"} onDeleteRunFunction={fetchclips} />)}
                            </div>
                            : <span className={`${ZenKakuGothicAntiqueBold.className} w-full desktop-h6 flex justify-center items-center uppercase text-center h-[200px]`}>{params.get("stage") === "1" ? "No Sub Clips" : "No Remixed Clips"}</span>
                        )}
                        {tab === 2 && (folderClips.length !== 0 ?
                            <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5'>
                                {folderClips.map((obj, index) => <FolderElement key={obj.clip_id} obj={obj} index={index} category={params.get("stage") === "1" ? "subclip" : "remixclip"} onDeleteRunFunction={fetchclips} />)}
                            </div>
                            : <span className={`${ZenKakuGothicAntiqueBold.className} w-full desktop-h6 flex justify-center items-center uppercase text-center h-[200px]`}>No Remixed Clips</span>
                        )}
                    </>
                }
            </div>
        </div>
    )
}
