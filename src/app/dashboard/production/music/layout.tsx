import React, { ReactNode } from 'react'
import NavigationBar from '../components/NavigationBar'
import CreateElement from '../components/CreateElement'

export const metadata = {
    title: 'Music',
};

export default function layout({ children }: { children: ReactNode }) {
    return (
        <div className='flex flex-col flex-1 h-[calc(100vh-72px)]'>
            <NavigationBar path='music' slice='music' />
            <div className='flex flex-col w-full gap-2 mt-3 h-full relative'>
                {children}
                <CreateElement path={"music"} />
            </div>
        </div>
    )
}
