"use client"

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { ZenKakuGothicAntiqueMedium } from '@/ui/fonts';
import { arrowDown } from '@/ui/icons';
import { Popover, Spinner } from 'flowbite-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { logoutUser, RootState } from '@/lib/store';
import { User2Icon } from 'lucide-react';
import { usePersistor } from '@/app/StoreProvider';

export default function Profile() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const persistor = usePersistor();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const email = useAppSelector((state: RootState) => state.user.email);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            router.replace("/");
            setTimeout(() => dispatch(logoutUser(persistor)), 1500);
        } catch (e) {
            toast.error("Failed to logout. Please try again.");
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <User2Icon className='w-10 h-10 p-[10px] bg-neutral-50 rounded-full' color='#000' />
            <Popover
                className='z-50 bg-white rounded-lg'
                arrow={false}
                placement='auto'
                content={
                    <div className="flex flex-col justify-center items-center gap-1 py-5 px-10">
                        <User2Icon className='w-12 h-12 p-2 bg-neutral-950 rounded-full' color='#fff' />
                        <span title={email} className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline text-black text-center line-clamp-1`}>
                            {email}
                        </span>
                        <div className='flex gap-3 items-center justify-center mt-2'>
                            {/* <button
                                className={`${ZenKakuGothicAntiqueMedium.className} text-small bg-[#D9D9D9] hover:bg-[#CCCCCC] text-black transition-colors rounded-md py-2 px-3`}
                            >
                                Edit Profile
                            </button> */}
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className={`
                                        ${ZenKakuGothicAntiqueMedium.className} 
                                        text-small text-white bg-blue-600 hover:bg-blue-500 
                                        text-center cursor-pointer
                                        flex items-center justify-center py-2 px-3
                                        rounded-md transition-colors
                                        disabled:cursor-not-allowed disabled:opacity-50
                                    `}
                            >
                                {isLoggingOut ? (
                                    <Spinner size="sm" className="mr-2" />
                                ) : null}
                                Logout
                            </button>
                        </div>
                    </div>
                }
            >
                <Image
                    src={arrowDown}
                    alt="arrow down"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                />
            </Popover >
        </>
    );
}