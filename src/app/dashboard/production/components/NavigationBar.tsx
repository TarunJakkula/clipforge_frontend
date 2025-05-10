"use client"

import { fetchBreadCrumbs as fetchMusicBreadCrumbs } from '@/lib/features/music/musicSlice';
import { fetchBreadCrumbs as fetchBrollBreadCrumbs } from '@/lib/features/brolls/brollSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { ZenKakuGothicAntiqueBlack, ZenKakuGothicAntiqueRegular } from '@/ui/fonts'
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'

type SliceName = 'brolls' | 'music';


export default function NavigationBar({ path, slice }: { path: string, slice: SliceName }) {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const breadcrumbs = useAppSelector((state: RootState) => state[slice].breadcrumbs);
    const loading = useAppSelector((state: RootState) => state[slice].loadingBreadCrumbs);
    useEffect(() => {
        if (id) {
            if (slice === "brolls")
                dispatch(fetchBrollBreadCrumbs({ id }))
            if (slice === "music")
                dispatch(fetchMusicBreadCrumbs({ id }))
        }
    }, [id, slice])


    return (
        <nav className='w-full flex justify-start items-center px-10 py-5 pt-10 bg-neutral-950 gap-5'>
            <span className={`${ZenKakuGothicAntiqueRegular.className} flex items-center uppercase desktop-tagline text-neutral-50`}>
                {breadcrumbs.map((ele, index) =>
                (index === breadcrumbs.length - 1 ?
                    <span key={index} className={`flex items-center ${ZenKakuGothicAntiqueBlack.className} text-blue-600`}>{ele.name}</span>
                    :
                    <Link key={index} href={{ pathname: `/dashboard/production/${path}/${ele.id}` }} className="flex items-center">{ele.name}&nbsp;<ChevronRight />&nbsp;</Link>
                ))}
            </span>
            {loading && <div className='loader' />}
        </nav>
    )
}
