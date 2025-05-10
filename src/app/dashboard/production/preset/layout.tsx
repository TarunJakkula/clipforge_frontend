import React from 'react'
import NavigationBar from './components/NavigationBar'

export const metadata = {
    title: 'Presets',
};

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex flex-col flex-1 h-[calc(100vh-72px)] justify-start'>
            <NavigationBar />
            {children}
        </div>
    )
}
