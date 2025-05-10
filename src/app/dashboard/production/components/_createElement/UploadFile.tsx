'use client'

import { ZenKakuGothicAntiqueBold, ZenKakuGothicAntiqueMedium, ZenKakuGothicAntiqueRegular } from '@/ui/fonts';
import { Dispatch, FormEvent, SetStateAction, useCallback, useEffect, useState } from 'react'
import DragAndDrop from '../DragAndDrop';
import { LoaderCircle, XIcon } from 'lucide-react';
import CreatableSelect from "react-select/creatable";
import { ActionMeta, MultiValue } from 'react-select';
import toast from 'react-hot-toast';
import { ApiErrorResponse, CompleteUploadRequest, CompleteUploadResponse, InitiateUploadResponse, UploadChunkResponse, UploadPart } from '../../upload/page';
import { AxiosError, AxiosProgressEvent } from 'axios';
import axiosInstance from '@/util/axiosInstance';
import { RootState } from '@/lib/store';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useParams } from 'next/navigation';
import { pushFile as pushMusicFile } from '@/lib/features/music/musicSlice';
import { pushFile as pushVideoFile } from '@/lib/features/brolls/brollSlice';


const CHUNK_SIZE = 5 * 1024 * 1024;

type OptionType = {
    value: string;
    label: string;
};

interface CompleteUpload extends CompleteUploadRequest {
    tags: string[];
    parent_id: string;
}

export default function UploadFile({ setOpenModal, path, type }: { setOpenModal: Dispatch<SetStateAction<boolean>>; path: string; type: string; }) {
    const { id } = useParams<{ id: string }>();
    const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace)
    const userId = useAppSelector((state: RootState) => state.user.uid);
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [status, setStatus] = useState<string>('placeholder');
    const [options, setOptions] = useState<OptionType[]>([
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
    ]);
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axiosInstance.get("fetch_all_tags", { params: { space_id: activeSpace?.space_id, category: path } });
                setOptions(response.data.tags);
            } catch (e) {
                console.error(e);
            }
        }
        fetchTags();
    }, [activeSpace])

    /**
     *  Form values
     */
    const [label, setLabel] = useState("");
    const [selectedOptions, setSelectedOptions] = useState<MultiValue<OptionType>>([]);
    const [aspectRatio, setAspectRatio] = useState<"shortform" | "longform">('longform');

    const handleChange = (
        selected: MultiValue<OptionType>,
        _actionMeta: ActionMeta<OptionType>
    ) => {
        setSelectedOptions(selected);
    };

    const handleCreate = (inputValue: string) => {
        const listOfValues = inputValue.split(",").filter((str) => str.trim().length !== 0);
        const newOptions = listOfValues.map((input) => ({ value: input, label: input }))
        setOptions((prevOptions) => [...prevOptions, ...newOptions]);
        setSelectedOptions((prevSelected) => [...prevSelected, ...newOptions]);
    };

    const initiateUpload = async (fileName: string): Promise<InitiateUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file_name', fileName + `.${type}`);
            formData.append('category', path);
            const { data } = await axiosInstance.post<InitiateUploadResponse>(
                '/initiate_upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return data;
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            throw new Error(
                `Failed to initiate upload: ${error.response?.data?.detail || error.message}`
            );
        }
    };

    const uploadChunk = async (
        chunk: Blob,
        fileName: string,
        uploadId: string,
        partNumber: number,
        fileId: string
    ): Promise<UploadPart> => {
        try {
            const formData = new FormData();
            formData.append('file_name', fileName + `.${type}`);
            formData.append('upload_id', uploadId);
            formData.append('part_number', partNumber.toString());
            formData.append('file', chunk);
            formData.append('file_id', fileId);
            formData.append('category', path);
            const { data } = await axiosInstance.post<UploadChunkResponse>(
                '/upload_chunks/',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                        if (progressEvent.total) {
                            const chunkProgress = (progressEvent.loaded / progressEvent.total) * 100;
                            const totalChunks = file ? Math.ceil(file.size / CHUNK_SIZE) : 1;
                            const overallProgress = ((partNumber - 1) * 100 + chunkProgress) / totalChunks;
                            setUploadProgress(Math.min(overallProgress, 99));
                        }
                    },
                }
            );
            return {
                ETag: data.ETag,
                PartNumber: partNumber,
            };
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            throw new Error(
                `Failed to upload chunk ${partNumber}: ${error.response?.data?.detail || error.message
                }`
            );
        }
    };

    const completeUpload = async (
        fileName: string,
        uploadId: string,
        parts: UploadPart[],
        fileId: string,
        tags: string[],
        id: string,
        aspectRatio: "shortform" | "longform"
    ): Promise<CompleteUploadResponse> => {
        try {

            const requestData: CompleteUpload = {
                file_name: fileName + `.${type}`,
                upload_id: uploadId,
                parts: parts,
                user_id: userId ?? "",
                space_id: activeSpace?.space_id ?? "",
                file_id: fileId,
                category: path,
                tags,
                parent_id: id,
            };
            if (path === "broll")
                requestData.aspect_ratio = aspectRatio;
            const { data } = await axiosInstance.post<CompleteUploadResponse>(
                '/complete_upload/',
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            setUploadProgress(100);
            return data;
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            throw new Error(
                `Failed to complete upload: ${error.response?.data?.detail || error.message}`
            );
        }
    };

    const handleUpload = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!file)
            return toast.error("File not found");

        try {
            setLoading(true);
            setStatus('Initiating upload...');
            const { uploadId, fileId } = await initiateUpload(label);
            const chunks: Blob[] = [];
            for (let i = 0; i < file.size; i += CHUNK_SIZE) {
                chunks.push(file.slice(i, i + CHUNK_SIZE));
            }
            const parts: UploadPart[] = [];
            for (let i = 0; i < chunks.length; i++) {
                setStatus(`Uploading part ${i + 1} of ${chunks.length}`);
                const part = await uploadChunk(chunks[i], label, uploadId, i + 1, fileId);
                parts.push(part);
            }
            setStatus('Completing upload...');
            const tags = selectedOptions.map((obj) => obj.value)
            const { clip_id, location } = await completeUpload(label, uploadId, parts, fileId, tags, id, aspectRatio);
            setStatus('Upload complete!');
            if (path === "broll")
                dispatch(pushVideoFile({ file: { name: label, parent: id, tags, id: clip_id, link: location, aspect_ratio: aspectRatio, owner_id: activeSpace?.space_id ?? "" }, parent_id: id }))
            if (path === "music")
                dispatch(pushMusicFile({ file: { name: label, parent: id, tags, id: clip_id, link: location, owner_id: activeSpace?.space_id ?? "" }, parent_id: id }))
            setLoading(false);
        } catch (err) {
            const e = err as Error;
            setStatus('');
            setFile(null);
            console.error(e)
            toast.error("Upload Failed, Try Again Later.")
        }
    }, [file, label, id, selectedOptions]);


    return (
        <>
            <div className='h-full w-full bg-black opacity-50' />
            {uploadProgress === 0 ? <form onSubmit={handleUpload} className='bg-white rounded-xl shadow-md md:w-[600px] w-full absolute flex flex-col p-5 gap-5 m-10'>
                <div className='flex justify-between items-center'>
                    <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-h6`}>Upload {path === "broll" ? "Video" : "Music"}</span>
                    <button onClick={() => setOpenModal(false)} type="button" className='hover:bg-neutral-300 rounded p-1 transition-colors'><XIcon color="#000" /></button>
                </div>
                <DragAndDrop file={file} setFile={setFile} setStatus={setStatus} setUploadProgress={setUploadProgress} type={path === "broll" ? "video/mp4" : "audio/mpeg"} className=' w-full' color="#000" backgroundColor="#f9fafb" required={true} />
                {path === "broll" && <div className='flex gap-5 w-full items-center'>
                    <span className={`${ZenKakuGothicAntiqueBold.className} text-neutral-950 desktop-tagline`}>Aspect Ratio : </span>
                    <div className="flex gap-2 items-center">
                        <input type="radio" id="shortform" value="shortform" name="videoForm" className="w-4 h-4 text-white bg-neutral-900 border-none focus:ring-none " checked={aspectRatio === 'shortform'} onChange={(e) => setAspectRatio(e.target.value as any)} />
                        <span className={`${ZenKakuGothicAntiqueRegular.className} desktop-tagline text-neutral-950`}>Shortform</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <input type="radio" id="longform" value="longform" name="videoForm" className="w-4 h-4 text-white bg-neutral-900 border-none focus:ring-none " checked={aspectRatio === 'longform'} onChange={(e) => setAspectRatio(e.target.value as any)} />
                        <span className={`${ZenKakuGothicAntiqueRegular.className} desktop-tagline text-neutral-950`}>Longform</span>
                    </div>
                </div>}
                <label htmlFor="name" className='flex flex-col gap-2 desktop-tagline'>
                    Name
                    <input type="text" id="name" value={label} onChange={(e) => setLabel(e.target.value)} required placeholder='File Name' className='border border-gray-300 rounded-lg p-4 text-small' />
                </label>
                <label htmlFor="tag" className='flex flex-col gap-2 desktop-tagline'>
                    Tags
                    <CreatableSelect
                        isMulti
                        id='tag'
                        value={selectedOptions}
                        options={options}
                        onChange={handleChange}
                        onCreateOption={handleCreate}
                        placeholder="E.g. motivation"
                        required
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderWidth: 1,
                                borderColor: "#d1d5db",
                                borderRadius: 8,
                                paddingRight: 8,
                                paddingLeft: 8,
                                paddingTop: 12,
                                paddingBottom: 12,
                                fontSize: 14
                            }),
                            multiValue: (base) => ({
                                ...base,
                                backgroundColor: "#3b82f6",
                                color: "#ffffff"
                            }),
                            multiValueLabel: (base) => ({
                                ...base,
                                color: "#ffffff",
                            }),
                        }}
                    />
                </label>
                <button type='submit' disabled={loading} className='rounded-lg p-4 cursor-pointer bg-blue-500 disabled:bg-neutral-400 px-8 text-white flex justify-center'>{!loading ? "Upload File" : <LoaderCircle className='animate-spin w-5 h-5' />}</button>
            </form>
                : <div className='bg-white rounded-xl shadow-md w-[600px] absolute max-h-full m-10 flex flex-col items-center p-5 pb-10 gap-12'>
                    <div className={`flex justify-between items-center ${uploadProgress === 100 && "w-full"}`}>
                        <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-h6`}>Uploading {path === "broll" ? "Video" : "Music"}</span>
                        {uploadProgress === 100 && <button onClick={() => setOpenModal(false)} className='hover:bg-neutral-300 rounded p-1 transition-colors'><XIcon color="#000" /></button>}
                    </div>
                    <div className='flex flex-col items-center gap-5'>
                        <div className="relative size-40">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">

                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 " strokeWidth="2"></circle>

                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-blue-600 " strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - Math.floor(uploadProgress)} strokeLinecap="round"></circle>
                            </svg>

                            <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                                <span className="text-center text-2xl font-bold text-blue-600 dark:text-blue-500">{Math.floor(uploadProgress)}%</span>
                            </div>
                        </div>
                        <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline`}>{status}</span>
                    </div>
                </div>
            }
        </>
    )
}
