'use client';

import { Dispatch, DragEvent, SetStateAction, useRef, useState } from 'react'
import toast from 'react-hot-toast';

type DragAndDropProps = {
    setFile: Dispatch<SetStateAction<File | null>>;
    setUploadProgress: Dispatch<SetStateAction<number>>;
    setStatus: Dispatch<SetStateAction<string>>;
    file: File | null;
    type: "video/mp4" | "audio/mpeg";
    className?: string;
    color?: string;
    backgroundColor?: string;
    required?: boolean;
}

export default function DragAndDrop({ setFile, setUploadProgress, setStatus, file, type, className, color, backgroundColor, required = false }: DragAndDropProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadProgress(0);
            setStatus('');
        } else if (!event.target.files) {
            toast("No file found", {
                icon: "❗"
            })
        }
    };


    const handleFileValidation = (file: File | null) => {
        if (!file) {
            toast.error("No file found")
            return null;
        }
        if (file.type !== type) {
            toast.error(`Upload an ${type === 'audio/mpeg' ? "MP3" : "MP4"} file only`)
            return null;
        }
        return file;
    };


    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);

        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles.length > 0) {
            const selectedFile = droppedFiles[0];
            const validatedFile = handleFileValidation(selectedFile);
            setFile(validatedFile);
            setUploadProgress(0);
            setStatus('');
        }
    };

    return (
        <div className="flex items-center justify-center w-full max-w-[800px]"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}>
            <label htmlFor="dropzone-file"
                style={{ backgroundColor }}
                className={`${isDragActive && 'border-blue-500'} flex flex-col items-center justify-center w-full border-2 transition-all border-gray-300 border-dashed rounded-lg cursor-pointer bg-neutral-800 hover:bg-gray-100 ${className ?? ""}`}>
                <div className="flex flex-col items-center justify-center py-6 ">
                    <svg className="w-8 h-8 mb-2" color={color ?? "#6b7280"} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                    </svg>
                    <span className=" desktop-tagline text-center" style={{ color: color ?? "#6b7280" }}>{file ? file.name : 'Click to Upload or Drag and Drop'}</span>
                </div>
                <input
                    ref={fileInputRef}
                    id="fileInput"
                    type="file"
                    name="file"
                    className="hidden"
                    // required={required}
                    accept={type}
                    onChange={handleFileChange}
                />
            </label>
        </div>
    )
}
