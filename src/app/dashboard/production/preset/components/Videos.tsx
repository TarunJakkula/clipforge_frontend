import React from 'react'
import VideoPlayer from '../../components/VideoPlayer';
import { type Video } from '../page';
import { handleDownload } from '@/util/downloader';

type VideoProps = {
    tab: 1 | 2, // 1 - shortform, 2 - longform
    videos: Video[];
}

export default function Videos({ tab, videos }: VideoProps) {
    return (
        <>
            {
                videos.length !== 0 ?
                    <div className={`grid ${tab === 1 ? "grid-cols-[repeat(auto-fill,minmax(180px,1fr))]" : "grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))]"} gap-5 text-white `}>
                        {videos.map((obj, index) =>
                            <div key={index} className='relative '>
                                <VideoPlayer src={obj.clip_link ?? ""} autoPlay={false} aspectRatio={tab === 1 ? "9/16" : "16/9"} />
                                <button className={`bg-white rounded-lg px-1 py-1 absolute ${tab === 1 ? "top-[5%]" : "top-[10%]"} right-[5%]`} onClick={handleDownload(obj.clip_link, obj.clip_name, ".mp4")}>
                                    <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M13 11.15V4a1 1 0 1 0-2 0v7.15L8.78 8.374a1 1 0 1 0-1.56 1.25l4 5a1 1 0 0 0 1.56 0l4-5a1 1 0 1 0-1.56-1.25L13 11.15Z" clipRule="evenodd" />
                                        <path fillRule="evenodd" d="M9.657 15.874 7.358 13H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.358l-2.3 2.874a3 3 0 0 1-4.685 0ZM17 16a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17Z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                    : <span className='flex flex-1 justify-center items-center text-white'>
                        No Videos
                    </span>
            }
        </>
    )
}
