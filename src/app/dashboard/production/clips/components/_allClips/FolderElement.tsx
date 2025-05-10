import React, { KeyboardEvent, useState } from 'react'
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { ZenKakuGothicAntiqueRegular } from '@/ui/fonts';

import '@szhsin/react-menu/dist/index.css';
import { FolderClosedIcon } from 'lucide-react';
import axiosInstance from '@/util/axiosInstance';
import toast from 'react-hot-toast';

export default function Element({ obj, index, category, onDeleteRunFunction }: { obj: any, index: number, category: string, onDeleteRunFunction: () => void }) {
    const [menuState, setMenuState] = useMenuState();
    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
    const params = useSearchParams();
    const [rename, setRename] = useState(false)
    const [newName, setNewName] = useState<string>(obj.clip_name);
    const router = useRouter();

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
        const loading = toast.loading("Deleting Folder");
        try {
            await axiosInstance.delete("/delete_video", { params: { id: obj.clip_id, category } });
            setTimeout(() => {
                onDeleteRunFunction();
                toast.dismiss(loading);
                toast.success("Folder deleted");
            },
                2000
            )
        } catch (e) {
            toast.dismiss(loading);
            toast.error("Error while deleting!")
        }
    }

    return (
        <div title={obj.clip_name} onContextMenu={handleContextMenu} className='w-full gap-1 flex items-center bg-transparent rounded-lg relative'>
            <button onDoubleClick={() => router.push(`/dashboard/production/clips/${obj.clip_id}?stage=${parseInt(params.get("stage") ?? "0") + 1}`)} className=' w-full rounded-xl px-4 py-3 bg-neutral-900 flex flex-col gap-2 cursor-pointer text-neutral-50'>
                <FolderClosedIcon className="w-[40px] h-auto aspect-square" fill="#ffd32c" color='#ffd32c' />
                {!rename ? <span className={`${ZenKakuGothicAntiqueRegular.className} line-clamp-1 w-full text-start text-white desktop-tagline`}>{newName}</span>
                    :
                    <input className={`${ZenKakuGothicAntiqueRegular.className} line-clamp-1 w-full text-white desktop-tagline bg-transparent border border-white rounded px-2`} autoFocus={true} type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyUp={handleRename} onBlur={() => {
                        setNewName(obj.clip_name);
                        setRename(false);
                    }} />
                }
            </button>
            <ControlledMenu
                state={menuState.state}
                anchorPoint={anchorPoint}
                onClose={() => setMenuState(false)}
            >
                <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={handleDelete}>Delete</MenuItem>
                <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={() => setRename(true)}>Rename</MenuItem>
            </ControlledMenu>
        </div>
    )
}
