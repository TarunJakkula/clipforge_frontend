import { ZenKakuGothicAntiqueBold } from '@/ui/fonts'
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { RootState } from '@/lib/store'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { fetchNoSubClips } from '@/lib/features/clips/clipsSlice'
import Loading from './_loading/Loading'
import Element from './_noSubclips/Element'
import Image from 'next/image'
import { emptyFolderGreenIcon } from '@/ui/icons'

export default function NoSubclips() {
    const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const clips = useAppSelector((state: RootState) => state.clips.noSubClips.clips);
    const error = useAppSelector((state: RootState) => state.clips.noSubClips.error);
    const [aspectRatio, setAspectRatio] = useState<"longform" | "shortform">("longform");
    const lfCount = useAppSelector((state: RootState) => state.clips.noSubClips.longformCount);
    const sfCount = useAppSelector((state: RootState) => state.clips.noSubClips.shortformCount);

    useEffect(() => {
        if (error)
            toast.error('Error fetching clips with no subclips');
    }, [error])

    useEffect(() => {
        if (!activeSpace) return router.replace("/dashboard/production");
        dispatch(fetchNoSubClips(activeSpace.space_id))
    }, [activeSpace])

    if (!clips)
        return (
            <div className='grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 w-full'>
                <Loading height={180} />
                <Loading height={180} />
                <Loading height={180} />
                <Loading height={180} />
            </div>
        )

    return (
        <div className='flex flex-col w-full h-full gap-5 relative'>
            {clips.length === 0 ?
                <span className={`w-full text-center ${ZenKakuGothicAntiqueBold.className} h-full flex flex-col justify-center items-center desktop-h5 uppercase p-10`}>
                    <Image src={emptyFolderGreenIcon} alt='' className='w-14 h-14' />
                    No Clips
                </span> :
                <>
                    <div className='w-full flex justify-end items-center h-fit absolute bottom-0 left-0'>
                        <div className='bg-neutral-900 rounded-md flex gap-2 p-2 items-center'>
                            <button title='longform' className={`${aspectRatio === 'longform' ? "bg-neutral-50 text-black" : "hover:bg-neutral-800 bg-transparent text-neutral-50"} px-3 transition-all rounded-md`} onClick={() => setAspectRatio("longform")}>16:9</button>
                            <div className='h-4 w-[1px] bg-white' />
                            <button title='shortform' className={`${aspectRatio === 'shortform' ? "bg-neutral-50 text-black" : "hover:bg-neutral-800 bg-transparent text-neutral-50"}  px-3 transition-all rounded-md`} onClick={() => setAspectRatio("shortform")}>9:16</button>
                        </div>
                    </div>
                    {aspectRatio === "longform" &&
                        (lfCount !== 0 ?
                            <div className={`grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 w-full`}>
                                {
                                    clips.map((obj, index) => obj.aspect_ratio === aspectRatio && <Element key={obj.clip_id} obj={obj} index={index} />)
                                }
                            </div> :
                            <span className={`w-full text-center h-full flex gap-3 justify-center items-center desktop-tagline uppercase p-10`}>
                                <div className='w-[80px] h-[45px] border border-blue-500 rounded-lg flex justify-center items-center' >16:9</div>
                                Empty
                            </span>
                        )
                    }
                    {aspectRatio === "shortform" &&
                        (sfCount !== 0 ?
                            <div className={`grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-8 w-full`}>
                                {
                                    clips.map((obj, index) => obj.aspect_ratio === aspectRatio && <Element key={obj.clip_id} obj={obj} index={index} />)
                                }
                            </div> :
                            <span className={`w-full text-center h-full flex flex-col gap-3 justify-center items-center desktop-tagline uppercase p-10`}>
                                <div className='w-[50px] h-[80px] border border-rose-500 rounded-lg flex justify-center items-center' >9:16</div>
                                Empty
                            </span>
                        )
                    }
                </>
            }

        </div>
    )
}
