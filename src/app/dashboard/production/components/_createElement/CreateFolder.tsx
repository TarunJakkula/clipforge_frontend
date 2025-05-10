'use client'

import { pushFolder as pushMusicFolder } from '@/lib/features/music/musicSlice';
import { pushFolder as pushBrollFolder } from '@/lib/features/brolls/brollSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import axiosInstance from '@/util/axiosInstance';
import { useParams } from 'next/navigation';
import React, { Dispatch, SetStateAction, useState } from 'react'
import toast from 'react-hot-toast';
import { RootState } from '@/lib/store';

export default function CreateFolder({ setOpenModal, path }: { setOpenModal: Dispatch<SetStateAction<boolean>>, path: string }) {
    const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace);
    const [folderName, setFolderName] = useState("");
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();

    const handleCreateFolder = async () => {
        const category = path;
        const parent_id = id;
        const folder_name = folderName === "" ? "Untitled" : folderName;
        try {
            const { data } = await axiosInstance.post("/create_folder", { category, parent_id, folder_name, space_id: activeSpace?.space_id });
            if (path === "broll")
                dispatch(pushBrollFolder({ folder: { id: data.folder_id, parent: parent_id, name: folder_name, owner_id: activeSpace?.space_id ?? "" }, parent_id }))
            if (path === "music")
                dispatch(pushMusicFolder({ folder: { id: data.folder_id, parent: parent_id, name: folder_name, owner_id: activeSpace?.space_id ?? "" }, parent_id }))

        } catch (e) {
            console.error(e);
            toast.error("Error creating folder");
        } finally {
            setOpenModal(false);
        }
    }

    return (
        <>
            <div className='h-full w-full px-5 bg-[#00000052]' onClick={() => setOpenModal(false)} />
            <div className='bg-white rounded-lg shadow-md w-[400px] absolute flex flex-col p-5 gap-5'>
                <label htmlFor="foldername" className='flex flex-col gap-2 desktop-tagline'>
                    Folder Name
                    <input type="text" id="foldername" className='py-2 px-4 rounded-md border border-black' placeholder='Folder Name' value={folderName} onChange={(e) => setFolderName(e.target.value)} />
                </label>
                <div className='flex items-center gap-4 justify-end'>
                    <button className='py-2 px-4 border border-black rounded-lg bg-neutral-950 text-neutral-50 w-1/2' onClick={handleCreateFolder}> Create </button>
                    <button className='py-2 px-4 rounded-lg border border-black hover:bg-gray-200 w-1/2' onClick={() => { setOpenModal(false); setFolderName(""); }}> Cancel </button>
                </div>
            </div>
        </>
    )
}
