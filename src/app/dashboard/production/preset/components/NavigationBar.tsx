"use client"

import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { ZenKakuGothicAntiqueBlack, ZenKakuGothicAntiqueRegular } from '@/ui/fonts'
import { instagram, tiktok, xwhite, youtube } from '@/ui/icons';
import Image from 'next/image';
import { notFound, usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function NavigationBar() {
    const params = useSearchParams();
    const pathname = usePathname();
    const [presetName, setPresetName] = useState("");
    const presets = useAppSelector((state: RootState) => state.presets.presets)
    const [mediaIds, setMediaIds] = useState<{ insta: string | null; youtube: string | null; tiktok: string | null; x: string | null; }>({ insta: null, youtube: null, tiktok: null, x: null });


    useEffect(() => {
        setPresetName("")
        const presetId = params.get("preset_id");
        if (pathname.includes("preset/settings"))
            return setPresetName("Settings")
        if (!presetId)
            notFound();
        const preset = presets?.find((obj) => obj.preset_id === presetId);
        setPresetName(preset?.name ?? "");
        setMediaIds(preset?.media_ids ?? { insta: null, youtube: null, tiktok: null, x: null });
    }, [pathname, params, presets])

    return (
        <nav className='w-full flex justify-between flex-wrap items-center px-10 py-5 pt-10 bg-neutral-950 gap-5'>
            <span className={`${ZenKakuGothicAntiqueRegular.className} flex items-center uppercase desktop-tagline text-neutral-50`}>
                <span className={`flex items-center ${ZenKakuGothicAntiqueBlack.className}`}>preset&nbsp;<span className={`${presetName === "" && "animate-pulse"}`}>{presetName !== "" ? ` / ${presetName}` : `...`}</span></span>
            </span>
            {!pathname.includes("settings") &&
                <div className="flex gap-4 items-center flex-wrap">
                    {mediaIds.insta &&
                        <>
                            <div className='flex gap-2 items-center'>
                                <Image src={instagram} alt="Instagram" className={`w-7 h-7 object-contain transition-all cursor-pointer rounded-xl`} />
                                <span className={`${ZenKakuGothicAntiqueRegular.className} text-neutral-50 text-small`}>{mediaIds.insta}</span>
                            </div>
                            {mediaIds.youtube && <div className='h-5 w-[1px] bg-white' />}
                        </>}
                    {mediaIds.youtube &&
                        <>
                            <div className='flex gap-2 items-center'>
                                <Image src={youtube} alt="Youtube" className={`w-7 h-7 object-contain transition-all select-none cursor-pointer rounded-xl`} />
                                <span className={`${ZenKakuGothicAntiqueRegular.className} text-neutral-50 text-small`}>{mediaIds.youtube}</span>
                            </div>
                            {mediaIds.tiktok && <div className='h-5 w-[1px] bg-white' />}
                        </>}
                    {mediaIds.tiktok &&
                        <>
                            <div className='flex gap-2 items-center'>
                                <Image src={tiktok} alt="Tiktok" className={`w-7 h-7 object-contain transition-all cursor-pointer rounded-xl`} />
                                <span className={`${ZenKakuGothicAntiqueRegular.className} text-neutral-50 text-small`}>{mediaIds.tiktok}</span>
                            </div>
                            {mediaIds.x && <div className='h-5 w-[1px] bg-white' />}
                        </>}
                    {mediaIds.x &&
                        <div className='flex gap-2 items-center'>
                            <Image src={xwhite} alt="X" className={`w-7 h-7 object-contain transition-all cursor-pointer rounded-xl`} />
                            <span className={`${ZenKakuGothicAntiqueRegular.className} text-neutral-50 text-small`}>{mediaIds.x}</span>
                        </div>
                    }
                </div>}
        </nav>
    )
}
