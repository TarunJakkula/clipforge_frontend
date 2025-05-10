import { ZenKakuGothicAntiqueMedium, ZenKakuGothicAntiqueRegular } from '@/ui/fonts';
import { ArrowDownToLineIcon, FolderClosedIcon, FolderSyncIcon, MusicIcon, VideoIcon, XIcon } from 'lucide-react'
import React, { KeyboardEvent, useState } from 'react'
import { ControlledMenu, MenuItem, SubMenu, useMenuState } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import VideoPlayer from './VideoPlayer';
import MusicPlayer from './MusicPlayer';
import { useAppDispatch } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { handleDownload } from '@/util/downloader';
import axiosInstance from '@/util/axiosInstance';
import toast from 'react-hot-toast';

// different actions for broll, music and respsective folders
import { handleMoveFile as handleBrollMoveFile, handleMoveFolder as handleBrollMoveFolder } from '@/lib/features/brolls/brollSlice';
import { handleMoveFile as handleMusicMoveFile, handleMoveFolder as handleMusicMoveFolder } from '@/lib/features/music/musicSlice';
import { popFile as popBrollFile, popFolder as popBrollFolder } from '@/lib/features/brolls/brollSlice';
import { popFile as popMusicFile, popFolder as popMusicFolder } from '@/lib/features/music/musicSlice';
import { renameFile as renameMusicFile, renameFolder as renameMusicFolder } from '@/lib/features/music/musicSlice';
import { renameFile as renameBrollFile, renameFolder as renameBrollFolder } from '@/lib/features/brolls/brollSlice';
import ChangeTags from './ChangeTags';
import { Popover } from 'flowbite-react';
import SharingPage from './_element/SharingPage';

export type ElementProps = {
    name: string;
    parent: string;
    id: string;
    link?: string;
    tags?: string[];
    aspect_ratio?: "shortform" | "longform"
    owner_id: string;
}

type Props = {
    obj: ElementProps;
    path: "broll" | "music";
    type: "folder" | "file";
    inactive: boolean;
    spaceId: string;
}


export default function Element({ obj, path, type, inactive, spaceId }: Props) {
    const [menuState, setMenuState] = useMenuState();
    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
    const [showFull, setShowFull] = useState(false);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [rename, setRename] = useState(false)
    const [newName, setNewName] = useState<string>(obj.name);
    const [openTagsModal, setOpenTagsModal] = useState(false);
    const [openSharingPopover, setOpenSharingPopover] = useState(false);


    const handleContextMenu = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault();
        if (inactive) return;
        setAnchorPoint({ x: e.clientX, y: e.clientY });
        setMenuState(true)
    };

    const handleCut = (obj: ElementProps, path: "broll" | "music", category: "folder" | "broll" | "music") => async () => {
        switch (path + "," + category) {
            case "broll" + "," + "folder":
                dispatch(handleBrollMoveFolder({ folder: obj }));
                break;
            case "music" + "," + "folder":
                dispatch(handleMusicMoveFolder({ folder: obj }));
                break;
            case "broll" + "," + "broll":
                dispatch(handleBrollMoveFile({ file: obj }));
                break;
            case "music" + "," + "music":
                dispatch(handleMusicMoveFile({ file: obj }));
                break;
        }
    }
    const handleDelete = (obj: ElementProps, path: "broll" | "music", category: "folder" | "broll" | "music") => async () => {
        if (!confirm("Are you sure?")) return;
        try {
            await axiosInstance.delete("/delete", { params: { id: obj.id, category, space_id: spaceId } });
            switch (path + "," + category) {
                case "broll" + "," + "folder":
                    dispatch(popBrollFolder({ parent_id: obj.parent, id: obj.id }));
                    break;
                case "music" + "," + "folder":
                    dispatch(popMusicFolder({ parent_id: obj.parent, id: obj.id }));
                    break;
                case "broll" + "," + "broll":
                    dispatch(popBrollFile({ parent_id: obj.parent, id: obj.id }))
                    break;
                case "music" + "," + "music":
                    dispatch(popMusicFile({ parent_id: obj.parent, id: obj.id }))
                    break;
            }
        } catch (e) {
            console.error(e);
            toast.error("Error while deleting");
        }
    }

    const handleRename = (obj: ElementProps, path: "broll" | "music", category: "folder" | "broll" | "music") => async (e: KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.key === 'Enter') {
            if (newName === "") {
                toast("Empty name", {
                    icon: "❗"
                })
                setNewName(obj.name);
                setRename(false);
                return;
            }
            try {
                await axiosInstance.post("/update_name", { id: obj.id, name: newName, category });
                switch (path + "," + category) {
                    case "broll" + "," + "folder":
                        dispatch(renameBrollFolder({ id: obj.id, parent_id: obj.parent, name: newName }));
                        break;
                    case "music" + "," + "folder":
                        dispatch(renameMusicFolder({ id: obj.id, parent_id: obj.parent, name: newName }));
                        break;
                    case "broll" + "," + "broll":
                        dispatch(renameBrollFile({ id: obj.id, parent_id: obj.parent, name: newName }));
                        break;
                    case "music" + "," + "music":
                        dispatch(renameMusicFile({ id: obj.id, parent_id: obj.parent, name: newName }));
                        break;
                }
                toast.success("Rename successful");
            } catch (e) {
                toast.error("Error during rename");
                setNewName(obj.name);
            } finally {
                setRename(false);
            }
        }
    }

    return (
        <>
            <Popover
                key={obj.id}
                arrow={false}
                open={openSharingPopover}
                placement="right"
                content={
                    <SharingPage title={obj.name} setOpen={setOpenSharingPopover} objectId={obj.id} spaceId={spaceId} category={path} />
                }
                className="bg-neutral-800 rounded-2xl"
            >
                {type === "file" ?
                    <button disabled={inactive} onDoubleClick={() => setShowFull(true)} title={obj.name} onContextMenu={handleContextMenu} className='w-full h-fit rounded-xl px-6 py-3 bg-neutral-900 flex items-center gap-5 cursor-pointer text-neutral-50 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed'>
                        {path === "broll" && <VideoIcon className="w-[40px] h-auto aspect-square" color="#e11d48" />}
                        {path === "music" && <MusicIcon className="w-[40px] h-auto aspect-square" color='#0000ff' />}
                        {!rename ? <span className={`${ZenKakuGothicAntiqueRegular.className} w-4/5 text-large text-start line-clamp-1`}>{newName}</span>
                            :
                            <input className={`${ZenKakuGothicAntiqueRegular.className} w-4/5 text-large text-start line-clamp-1 bg-transparent border border-white rounded px-2`} autoFocus={true} type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyUp={handleRename(obj, path, path === "music" ? "music" : "broll")} onBlur={() => {
                                setNewName(obj.name);
                                setRename(false);
                            }} />
                        }
                    </button>
                    : <button disabled={inactive} onDoubleClick={() => {
                        router.replace(`/dashboard/production/${path}/${obj.id}`)
                    }} onContextMenu={handleContextMenu} title={obj.name} className=' w-full h-fit rounded-xl px-6 py-3 bg-neutral-900 flex items-center gap-5 cursor-pointer text-neutral-50 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed '>

                        {obj.owner_id !== spaceId ? <FolderSyncIcon className="w-[40px] h-auto aspect-square" color="#3b82f6" /> : <FolderClosedIcon className="w-[40px] h-auto aspect-square" color="#ffd32c" />}
                        {!rename ? <span className={`${ZenKakuGothicAntiqueRegular.className} w-4/5 text-large text-start line-clamp-1`}>{newName}</span>
                            :
                            <input className={`${ZenKakuGothicAntiqueRegular.className} w-4/5 text-large text-start line-clamp-1 bg-transparent border border-white rounded px-2`} autoFocus={true} type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyUp={handleRename(obj, path, "folder")} onBlur={() => {
                                setNewName(obj.name);
                                setRename(false);
                            }} />
                        }

                    </button>}
            </Popover>
            {(type === "file" || obj.owner_id === spaceId) && <ControlledMenu
                state={menuState.state}
                anchorPoint={anchorPoint}
                onClose={() => setMenuState(false)}
            >
                {type === "file" && <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={handleDownload(obj.link ?? "", obj.name, path === "broll" ? ".mp4" : ".mp3")}>Download</MenuItem>}
                {obj.owner_id === spaceId && <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={handleDelete(obj, path, type === "folder" ? "folder" : path === "broll" ? "broll" : "music")}>Delete</MenuItem>}
                {(obj.owner_id === spaceId && type === "folder") && <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={() => setOpenSharingPopover(true)}>
                    Share
                </MenuItem>}
                <SubMenu label="Edit" className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`}>
                    <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={() => setRename(true)}>Rename</MenuItem>
                    {type === "file" && <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={() => setOpenTagsModal(true)}>Change tags</MenuItem>}
                    <MenuItem className={`desktop-tagline ${ZenKakuGothicAntiqueRegular.className}`} onClick={handleCut(obj, path, type === "folder" ? "folder" : path === "broll" ? "broll" : "music")}>Move</MenuItem>
                </SubMenu>
            </ControlledMenu>}
            {showFull && <div className={`h-screen w-screen fixed top-0 left-0 flex justify-center z-50 items-center backdrop-blur-lg `} >
                <div className='h-full w-full bg-neutral-950 opacity-85' />
                <nav className='p-5 w-full flex items-center justify-between absolute gap-4 top-0'>
                    <div className='flex justify-start items-center gap-4'>
                        {path === "broll" && <VideoIcon className="w-[30px] h-auto aspect-square" color="#e11d48" />}
                        {path === "music" && <MusicIcon className="w-[30px] h-auto aspect-square" color="#0000ff" />}
                        <span className={`${ZenKakuGothicAntiqueRegular.className} text-medium text-start line-clamp-1 text-neutral-50`}>{obj.name}</span>
                    </div>
                    <div className='flex justify-start items-center gap-4'>
                        <button onClick={handleDownload(obj.link ?? "", obj.name, path === "broll" ? ".mp4" : ".mp3")} className={`p-3 py-1 rounded-md flex justify-center items-center gap-3 ${ZenKakuGothicAntiqueMedium.className} desktop-tagline text-black bg-white`}>
                            Download <ArrowDownToLineIcon width={"auto"} height={20} />
                        </button>
                        <button onClick={() => setShowFull(false)} className=' hover:scale-110 transition-all' >
                            <XIcon color="#fff" />
                        </button>
                    </div>
                </nav>
                <div className={`shadow-md ${obj.aspect_ratio === "longform" ? "w-1/2" : "w-[400px]"} absolute flex flex-col gap-5`}>
                    <div className='flex justify-center w-full gap-3 flex-wrap'>
                        <span className={`${ZenKakuGothicAntiqueRegular.className} desktop-tagline text-neutral-50`}>Tags : </span>
                        {obj.tags && obj.tags.map((ele, index) =>
                            index < 7 && <div key={index} className='bg-neutral-50 text-black py-1 px-3 rounded-md'>{ele}</div>
                        )}
                    </div>
                    {path === "broll" && <VideoPlayer src={obj.link ?? ""} autoPlay={true} aspectRatio={obj.aspect_ratio === "shortform" ? "9/16" : "16/9"} />}
                    {path === "music" && <MusicPlayer src={obj.link ?? ""} autoPlay={true} />}
                </div>
            </div>}
            {openTagsModal && <ChangeTags setOpenModal={setOpenTagsModal} path={path} obj={obj} />}
        </>

    )
}
