'use client';

import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { ZenKakuGothicAntiqueBold, ZenKakuGothicAntiqueMedium, ZenKakuGothicAntiqueRegular } from '@/ui/fonts';
import { arrowRight } from '@/ui/icons';
import axiosInstance from '@/util/axiosInstance';
import { AxiosError, AxiosProgressEvent } from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import DragAndDrop from '../components/DragAndDrop';

const CHUNK_SIZE = 5 * 1024 * 1024;

export interface InitiateUploadResponse {
    uploadId: string;
    fileId: string;
}

export interface UploadChunkResponse {
    ETag: string;
}

export interface CompleteUploadResponse {
    clip_id: string;
    location: string;
}

export interface UploadPart {
    ETag: string;
    PartNumber: number;
}

export interface CompleteUploadRequest {
    file_name: string;
    upload_id: string;
    parts: UploadPart[];
    user_id: string;
    space_id: string;
    file_id: string;
    category: string;
    aspect_ratio?: string;
}

export interface ApiErrorResponse {
    detail: string;
}

export default function Upload() {
    const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace)
    const userId = useAppSelector((state: RootState) => state.user.uid);
    const router = useRouter();
    const clipId = useRef("");
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [status, setStatus] = useState<string>('asd');
    const [videoForm, setVideoForm] = useState<"shortform" | "longform" | null>(null);


    const initiateUpload = async (fileName: string): Promise<InitiateUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file_name', fileName);
            formData.append('category', "clips");
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
            formData.append('file_name', fileName);
            formData.append('upload_id', uploadId);
            formData.append('part_number', partNumber.toString());
            formData.append('file', chunk);
            formData.append('file_id', fileId);
            formData.append('category', "clips");
            const { data } = await axiosInstance.post<UploadChunkResponse>(
                '/upload_chunks/',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                        if (progressEvent.total) {
                            // Calculate progress for this specific chunk
                            const chunkProgress = (progressEvent.loaded / progressEvent.total) * 100;
                            // Update overall progress considering all chunks
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
        videoForm: string
    ): Promise<CompleteUploadResponse> => {
        try {

            const requestData: CompleteUploadRequest = {
                file_name: fileName,
                upload_id: uploadId,
                parts: parts,
                user_id: userId ?? "",
                space_id: activeSpace?.space_id ?? "",
                file_id: fileId,
                category: "clips",
                aspect_ratio: videoForm
            };

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

    const handleUpload = useCallback(async () => {
        if (!videoForm) {
            toast("Aspect ratio not set", {
                icon: "❗"
            })
            return;
        }
        if (!file) {
            toast("File Not found", {
                icon: "❗"
            })
            return;
        }

        try {
            setStatus('Initiating upload...');
            const { uploadId, fileId } = await initiateUpload(file.name);
            const chunks: Blob[] = [];
            for (let i = 0; i < file.size; i += CHUNK_SIZE) {
                chunks.push(file.slice(i, i + CHUNK_SIZE));
            }

            const parts: UploadPart[] = [];
            for (let i = 0; i < chunks.length; i++) {
                setStatus(`Uploading part ${i + 1} of ${chunks.length}`);
                const part = await uploadChunk(chunks[i], file.name, uploadId, i + 1, fileId);
                parts.push(part);
            }

            setStatus('Completing upload...');
            const result = await completeUpload(file.name, uploadId, parts, fileId, videoForm);
            clipId.current = result.clip_id;
            setStatus('Upload complete!');
        } catch (err) {
            const e = err as Error;
            setStatus('');
            setFile(null);
            console.error(e)
            toast.error("Upload Failed, Try Again Later.")
        }
    }, [file, videoForm]);


    const handleAutomate = (clipId: string) => async () => {
        try {
            await axiosInstance.post("/automate_process", { space_id: activeSpace?.space_id, clip_id: clipId });
            toast.success("Automation process started");
            return router.replace("/dashboard/production");
        } catch (e) {
            toast.success("Error initiating automation");
        }
    }

    useEffect(() => {
        if (!activeSpace) return router.replace("/dashboard/production")
        document.title = "Upload";
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (uploadProgress > 0 && uploadProgress < 100)
                e.preventDefault();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };


    }, [uploadProgress])


    return (
        <div className="h-[calc(100vh-72px)] flex flex-1 flex-col justify-center items-center bg-neutral-950 p-4 gap-5">
            {file && status ? <div className='flex flex-col justify-center gap-4 items-center md:w-5/6 w-full'>
                <div className='flex flex-col justify-center items-center w-full'>
                    <span className={`${ZenKakuGothicAntiqueBold.className} desktop-h1 text-neutral-50 text-center`}>{Math.floor(uploadProgress)}%</span>
                    <span className={`${ZenKakuGothicAntiqueBold.className} desktop-h5 text-neutral-50 text-center`}>{status}</span>
                </div>
                <div className='w-full h-1 bg-[#00B7FA] flex justify-end'>
                    <div className='h-full bg-white' style={{ width: `${100 - Math.floor(uploadProgress)}%` }} />
                </div>
                <span className={`${ZenKakuGothicAntiqueRegular.className} text-neutral-50 text-[20px] text-center mt-5`}>{file?.name}</span>
                {uploadProgress === 100 && <Link href={{ pathname: "/dashboard/production/transcript", query: { clip_id: clipId.current } }} className={`mt-5 flex justify-between bg-neutral-800 px-5 items-center w-[300px] h-[72px] rounded-xl`}>
                    <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline text-neutral-50`}>Generate Transcript</span>
                    <Image src={arrowRight} alt="arrow-right" />
                </Link>}
                {uploadProgress === 100 && <button onClick={handleAutomate(clipId.current)} className='flex justify-between bg-neutral-800 px-5 items-center w-[300px] h-[72px] rounded-xl'>
                    <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline text-neutral-50`}>Automate</span>
                    <Image src={arrowRight} alt="arrow-right" />
                </button>}
            </div>
                :
                <DragAndDrop file={file} setFile={setFile} setStatus={setStatus} setUploadProgress={setUploadProgress} type='video/mp4' />
            }

            {file && !status &&
                <>
                    <div className='flex gap-5 w-full justify-center items-center'>
                        <span className={`${ZenKakuGothicAntiqueBold.className} text-neutral-50 desktop-tagline`}>Aspect Ratio : </span>
                        <div className="flex gap-2 items-center">
                            <input type="radio" id="shortform" value="shortform" name="videoForm" className="w-4 h-4 cursor-pointer text-white bg-neutral-900 border-none focus:ring-none " checked={videoForm === 'shortform'} onChange={(e) => setVideoForm(e.target.value as any)} />
                            <span className={`${ZenKakuGothicAntiqueRegular.className} desktop-tagline text-neutral-50`}>Shortform</span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <input type="radio" id="longform" value="longform" name="videoForm" className="w-4 h-4 cursor-pointer text-white bg-neutral-900 border-none focus:ring-none " checked={videoForm === 'longform'} onChange={(e) => setVideoForm(e.target.value as any)} />
                            <span className={`${ZenKakuGothicAntiqueRegular.className} desktop-tagline text-neutral-50`}>Longform</span>
                        </div>
                    </div>
                    <button
                        onClick={handleUpload}
                        className=" text-neutral-50 text-regular bg-neutral-700 px-5 py-2 rounded-md"
                        disabled={!file || status.includes('Uploading')}
                    >
                        Upload File
                    </button>
                </>
            }
        </div>
    )
}
