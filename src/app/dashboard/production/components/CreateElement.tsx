"use client"

import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu'
import { PlusIcon } from 'lucide-react'
import React, { useState } from 'react'
import CreateFolder from './_createElement/CreateFolder';
import UploadFile from '../components/_createElement/UploadFile';
import { ZenKakuGothicAntiqueRegular } from '@/ui/fonts';

export default function CreateElement({ path }: { path: string }) {
    const [openFolderModal, setOpenFolderModal] = useState(false);
    const [openFileModal, setOpenFileModal] = useState(false);
    const [menuState, setMenuState] = useMenuState();
    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

    const handleMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setAnchorPoint({ x: e.clientX, y: e.clientY });
        setMenuState(true)
    };

    return (<>
        <button onClick={handleMenu} className='bg-neutral-800 shadow-md w-14 h-14 rounded-full flex justify-center items-center absolute bottom-5 right-5'>
            <PlusIcon color="#fff" />
        </button>
        <ControlledMenu
            state={menuState.state}
            anchorPoint={anchorPoint}
            align='end'
            onClose={() => setMenuState(false)}
        >
            <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={() => setOpenFileModal(true)}>Upload {path === "broll" && "Video"} {path === "music" && "Audio"}</MenuItem>
            <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={() => setOpenFolderModal(true)}>Create Folder</MenuItem>
        </ControlledMenu>
        {(openFileModal || openFolderModal) && <div className={`h-screen w-screen fixed top-0 left-0 flex justify-center items-center backdrop-blur-sm z-[100] overflow-y-auto`} >
            {openFolderModal && <CreateFolder setOpenModal={setOpenFolderModal} path={path} />}
            {openFileModal && <UploadFile setOpenModal={setOpenFileModal} path={path} type={path === "broll" ? "mp4" : "mp3"} />}
        </div>}
    </>
    )
}
