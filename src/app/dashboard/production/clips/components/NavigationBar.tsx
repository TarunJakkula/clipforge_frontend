'use client'

import { ZenKakuGothicAntiqueBlack, ZenKakuGothicAntiqueRegular } from '@/ui/fonts';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function NavigationBar() {
    const router = useRouter();
    const params = useSearchParams();
    const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
    const handleBack = () => {
        router.back();
    }

    useEffect(() => {
        const stage = params.get("stage");
        if (!stage) {
            router.replace("/dashboard/production/clips");
            setBreadcrumbs(['Clips'])
        }
        else {
            if (stage === "1")
                setBreadcrumbs(["Clips", "Stage 1"])
            if (stage === "2")
                setBreadcrumbs(['Clips', 'Stage 1', 'Stage 2'])
        }
    }, [params])

    return (
        <nav className='w-full flex justify-start items-center px-10 py-5 pt-10 bg-neutral-950 gap-5'>
            {breadcrumbs.length !== 1 && <button className={`${ZenKakuGothicAntiqueRegular.className} desktop-h6 text-neutral-50 flex items-center gap-5`} onClick={handleBack}>
                <ArrowLeftIcon color='white' width={25} height={25} />
            </button>}
            <span className={`${ZenKakuGothicAntiqueRegular.className} flex items-center uppercase desktop-tagline text-neutral-50`}>
                {breadcrumbs.map((ele, index) => (<span key={index} className={`flex items-center ${index === breadcrumbs.length - 1 && `${ZenKakuGothicAntiqueBlack.className} text-blue-600`}`}>{ele}{index !== breadcrumbs.length - 1 && " \\"}&nbsp;</span>
                ))}
            </span>
        </nav>
    )
}
