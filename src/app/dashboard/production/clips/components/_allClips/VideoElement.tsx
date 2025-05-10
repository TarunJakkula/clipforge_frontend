import React, { KeyboardEvent, useState } from 'react'
import VideoPlayer from '../../../components/VideoPlayer';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { ZenKakuGothicAntiqueRegular } from '@/ui/fonts';

import '@szhsin/react-menu/dist/index.css';
import toast from 'react-hot-toast';
import axiosInstance from '@/util/axiosInstance';
import { handleDownload } from '@/util/downloader';

export default function Element({ parentId, obj, index, showRemixButton, category, onDeleteRunFunction }: { parentId: string | undefined; obj: any, index: number, showRemixButton: boolean, category: string, onDeleteRunFunction: () => void }) {
    const [menuState, setMenuState] = useMenuState();
    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
    const [rename, setRename] = useState(false)
    const [newName, setNewName] = useState<string>(obj.clip_name);


    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        setAnchorPoint({ x: e.clientX, y: e.clientY });
        setMenuState(true)
    };

    const handleRename = async (e: KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (e.key === 'Enter') {
            if (newName === "") {
                toast("Empty name", {
                    icon: "❗"
                })
                setNewName(obj.clip_name);
                setRename(false);
                return;
            }
            try {
                await axiosInstance.post("/update_name", { id: obj.clip_id, name: newName, category });
                toast.success("Rename successful");
            } catch (e) {
                toast.error("Error during rename");
                setNewName(obj.clip_name);
            } finally {
                setRename(false);
            }
        }
    }

    const handleDelete = async () => {
        const loading = toast.loading("Deleting Video");
        try {
            await axiosInstance.delete("/delete_video", { params: { id: obj.clip_id, category } });
            setTimeout(() => {
                onDeleteRunFunction();
                toast.dismiss(loading);
                toast.success("Video deleted");
            },
                2000
            )
        } catch (e) {
            toast.dismiss(loading);
            toast.error("Error while deleting!")
        }
    }


    return (
        <div key={index} title={obj.clip_name} onContextMenu={handleContextMenu} className='w-full gap-1 flex flex-col items-center bg-transparent rounded-lg relative'>
            <VideoPlayer src={obj.clip_link ?? ""} aspectRatio={(obj.aspect_ratio && obj.aspect_ratio === "shortform") ? '9/16' : '16/9'} />
            {!rename ? <span className={`${ZenKakuGothicAntiqueRegular.className} text-center line-clamp-1 mt-2 text-white desktop-tagline`}>{newName}</span>
                :
                <input className={`${ZenKakuGothicAntiqueRegular.className} text-center line-clamp-1 mt-2 text-white desktop-tagline bg-transparent border border-white rounded px-2`} autoFocus={true} type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyUp={handleRename} onBlur={() => {
                    setNewName(obj.clip_name);
                    setRename(false);
                }} />
            }
            <ControlledMenu
                state={menuState.state}
                anchorPoint={anchorPoint}
                onClose={() => setMenuState(false)}
            >
                <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={handleDownload(obj.clip_link, obj.clip_name, ".mp4")}>Download</MenuItem>
                <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={() => setRename(true)}>Rename</MenuItem>
                <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={handleDelete}>Delete</MenuItem>
            </ControlledMenu>
        </div>
    )
}
