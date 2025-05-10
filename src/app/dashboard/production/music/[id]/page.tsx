'use client';

import { ZenKakuGothicAntiqueBlack, ZenKakuGothicAntiqueRegular } from "@/ui/fonts";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import Loading from "../../clips/components/_loading/Loading";
import Element from "../../components/Element";
import { FolderOpenIcon, TriangleAlertIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { fetchFolder, fetchMusic } from "@/lib/features/music/musicSlice";
import { handleMoveFile, handleMoveFolder, popFolder, popFile, pushFile, pushFolder } from "@/lib/features/music/musicSlice";
import { type Folder, type File } from "@/lib/features/music/musicSlice";
import { appEvents } from "@/util/Emitter";
import axiosInstance from "@/util/axiosInstance";
import toast from "react-hot-toast";


export default function page() {

    const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace);
    const router = useRouter();
    const { id: musicId } = useParams<{ id: string }>();
    const folders = useAppSelector((state: RootState) => state.music.folders);
    const files = useAppSelector((state: RootState) => state.music.files);
    const loadingFolders = useAppSelector((state: RootState) => state.music.loadingFolders)
    const loadingFiles = useAppSelector((state: RootState) => state.music.loadingFiles);
    const errorFolders = useAppSelector((state: RootState) => state.music.errorFolders)
    const errorFiles = useAppSelector((state: RootState) => state.music.errorFiles);
    const moveFolder = useAppSelector((state: RootState) => state.music.moveFolder);
    const moveFile = useAppSelector((state: RootState) => state.music.moveFile);
    const dispatch = useAppDispatch();

    const handleRevertFolderMove = () => {
        dispatch(handleMoveFolder({ folder: null }));
    }

    const handleRevertFileMove = () => {
        dispatch(handleMoveFile({ file: null }));
    }

    const handleFolderMove = (folder: Folder) => async () => {
        try {
            axiosInstance.post("/move", { sour_id: folder.id, dest_id: musicId, category: "folder" });
            dispatch(popFolder({ id: folder.id, parent_id: folder.parent }));
            dispatch(pushFolder({ folder, parent_id: musicId }));
            dispatch(handleMoveFolder({ folder: null }));
        } catch (e) {
            toast.error("Error moving folder");
        }
    }
    const handleFileMove = (file: File) => async () => {
        try {
            axiosInstance.post("/move", { sour_id: file.id, dest_id: musicId, category: "music" });
            dispatch(popFile({ id: file.id, parent_id: file.parent }));
            dispatch(pushFile({ file, parent_id: musicId }));
            dispatch(handleMoveFile({ file: null }));
        } catch (e) {
            toast.error("Error moving file");
        }
    }


    useEffect(() => {
        if (!activeSpace) return router.replace('/dashboard/production');
        appEvents.on("activeSpaceChanged", () => { return; })
        dispatch(fetchFolder({ parent_id: musicId, space_id: activeSpace.space_id }));
        dispatch(fetchMusic({ parent_id: musicId, space_id: activeSpace.space_id }));
    }, [musicId, activeSpace]);

    useLayoutEffect(() => {
        const handleSpaceChange = () => {
            router.push('/dashboard/production/music/root');
            return;
        };
        appEvents.on('activeSpaceChanged', handleSpaceChange);
        return () => {
            appEvents.off('activeSpaceChanged', handleSpaceChange);
        };
    }, [router]);

    if (loadingFolders || loadingFiles)
        return (
            <div className='grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 w-full px-10 py-5'>
                <Loading height={80} />
                <Loading height={80} />
                <Loading height={80} />
                <Loading height={80} />
            </div>
        )

    if (errorFolders && errorFiles)
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <TriangleAlertIcon className="w-[50px] h-auto aspect-square" fill="#ff0000" />
                <span className={` text-white ${ZenKakuGothicAntiqueRegular.className} desktop-h6`}>
                    Invalid Directory
                </span>
            </div>
        )

    if (!folders[musicId] || !files[musicId])
        return (
            <div className='grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 w-full px-10 py-5'>
                <Loading height={80} />
                <Loading height={80} />
                <Loading height={80} />
                <Loading height={80} />
            </div>
        )


    if (folders[musicId].length === 0 && files[musicId].length === 0)
        return (
            <>
                {(moveFile || moveFolder) && <div className="flex items-center gap-3 absolute bottom-7 right-24">
                    {moveFile && (moveFile.parent !== musicId ? <button className="text-white bg-blue-500 px-5 py-2 rounded-md" onClick={handleFileMove(moveFile)}>Move File Here</button> : <button className="text-white bg-rose-500 px-5 py-2 rounded-md" onClick={handleRevertFileMove}>Revert File Move</button>)}
                    {moveFolder && (moveFolder.parent !== musicId ? <button className="text-white bg-blue-500 px-5 py-2 rounded-md" onClick={handleFolderMove(moveFolder)}>Move Folder Here</button> : <button className="text-white bg-rose-700 px-5 py-2 rounded-md" onClick={handleRevertFolderMove}>Revert Folder Move</button>)}
                </div>}
                <div className="flex flex-col flex-1 justify-center items-center">
                    <FolderOpenIcon className="w-[50px] h-auto aspect-square" color="#000" fill="#ffd32c" />
                    <span className={` text-white ${ZenKakuGothicAntiqueRegular.className} desktop-h6`}>
                        Empty Folder
                    </span>
                </div>
            </>
        )

    return (
        <>
            {(moveFile || moveFolder) && <div className="flex items-center gap-3 absolute bottom-7 right-24">
                {moveFile && (moveFile.parent !== musicId ? <button className="text-white bg-blue-500 px-5 py-2 rounded-md" onClick={handleFileMove(moveFile)}>Move File Here</button> : <button className="text-white bg-rose-500 px-5 py-2 rounded-md" onClick={handleRevertFileMove}>Revert File Move</button>)}
                {moveFolder && (moveFolder.parent !== musicId ? <button className="text-white bg-blue-500 px-5 py-2 rounded-md" onClick={handleFolderMove(moveFolder)}>Move Folder Here</button> : <button className="text-white bg-rose-700 px-5 py-2 rounded-md" onClick={handleRevertFolderMove}>Revert Folder Move</button>)}
            </div>}
            {folders[musicId].length !== 0 && <>
                <span className={`${ZenKakuGothicAntiqueBlack.className} text-large text-start line-clamp-1 text-neutral-50 px-10`}>Folders</span>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 w-full px-10 py-5">
                    {folders[musicId].map((obj, index) => (
                        <Element key={obj.id} obj={obj} path={"music"} type={"folder"} inactive={moveFolder ? moveFolder.id === obj.id : false} spaceId={activeSpace?.space_id ?? ""} />
                    ))
                    }
                </div>
            </>
            }
            {files[musicId].length !== 0 && <>
                <span className={`${ZenKakuGothicAntiqueBlack.className} text-large text-start line-clamp-1 text-neutral-50 px-10`}>Files</span>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 w-full px-10 py-5">
                    {files[musicId].map((obj, index) => (
                        <Element key={obj.id} obj={obj} path={"music"} type={"file"} inactive={moveFile ? moveFile.id === obj.id : false} spaceId={activeSpace?.space_id ?? ""} />
                    ))
                    }
                </div>
            </>
            }

        </>
    )
}
