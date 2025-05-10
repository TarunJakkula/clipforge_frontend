import { ZenKakuGothicAntiqueBold } from '@/ui/fonts'
import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import { RootState } from '@/lib/store'
import toast from 'react-hot-toast'
import { fetchAllClips } from '@/lib/features/clips/clipsSlice'
import Loading from './_loading/Loading'
import FolderElement from "./_allClips/FolderElement"
import Image from 'next/image'
import { emptyFolderRedIcon } from '@/ui/icons'

export default function AllClips() {
    const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const clips = useAppSelector((state: RootState) => state.clips.allClips.clips);
    const error = useAppSelector((state: RootState) => state.clips.allClips.error);

    useEffect(() => {
        if (error)
            toast.error('Error fetching all clips');
    }, [error])

    useEffect(() => {
        if (!activeSpace) return router.replace("/dashboard/production");
        dispatch(fetchAllClips(activeSpace.space_id))
    }, [activeSpace])



    if (!clips)
        return (
            <div className='grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] text-neutral-200 gap-4 w-full'>
                <Loading height={80} />
                <Loading height={80} />
                <Loading height={80} />
                <Loading height={80} />
            </div>
        )


    return (
        <div className='flex flex-col w-full gap-5 h-full '>
            {
                clips.length === 0 ?
                    <span className={`w-full text-center ${ZenKakuGothicAntiqueBold.className} h-full flex flex-col items-center justify-center text-neutral-50 desktop-h5 uppercase p-10`}>
                        <Image src={emptyFolderRedIcon} alt='' className='w-14 h-14' />
                        No Clips
                    </span> :
                    <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4'>
                        {clips.map((obj, index) => <FolderElement key={obj.clip_id} obj={obj} index={index} category='clip' onDeleteRunFunction={() => dispatch(fetchAllClips(activeSpace?.space_id ?? ""))} />)}
                    </div>
            }
        </div>
    )
}
