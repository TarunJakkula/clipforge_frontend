import React, { Dispatch, KeyboardEvent, SetStateAction, useState } from 'react';
import { PromptProps } from "../page";
import { LoaderCircleIcon, PencilIcon, PlusIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '@/util/axiosInstance';

type PromptVersionProps = {
    prompts: PromptProps[];
    setPrompts: Dispatch<SetStateAction<PromptProps[]>>;
    activeId: string | null;
    setActiveId: Dispatch<SetStateAction<string | null>>;
    step: string;
    spaceId: string;
};

export default function PromptVersions({ prompts, setPrompts, activeId, setActiveId, step, spaceId }: PromptVersionProps) {
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.post("/add_prompt", { step, space_id: spaceId });
            setPrompts(prompts => [...prompts, { id: data.id, name: 'Untitled', active: false }]);
            setLoading(false);
        } catch (e) {
            setLoading(false);
            console.error(e);
            toast.error("Error creating new prompt");
        }
    };

    return (
        <div className='bg-transparent rounded-3xl px-5 pt-5 pb-3 min-w-[400px] '>
            <ul className='text-white max-h-[400px] overflow-y-auto'>
                {prompts.map((prompt) => (
                    <VersionItem
                        key={prompt.id}
                        prompt={prompt}
                        setPrompts={setPrompts}
                        activeId={activeId}
                        setActiveId={setActiveId}
                        step={step}
                        spaceId={spaceId}
                    />
                ))}
            </ul>
            <div className='flex justify-end mt-2'>
                <button onClick={handleAdd} disabled={loading} className='p-2 rounded-full bg-neutral-950 '>
                    {!loading ? <PlusIcon color='#fff' width={18} height={18} /> : <LoaderCircleIcon className='animate-spin' color='#fff' width={18} height={18} />}
                </button>
            </div>
        </div>
    );
}

const VersionItem = ({ prompt, setPrompts, activeId, setActiveId, step, spaceId }: {
    prompt: PromptProps;
    setPrompts: Dispatch<SetStateAction<PromptProps[]>>;
    activeId: string | null;
    setActiveId: Dispatch<SetStateAction<string | null>>;
    step: string;
    spaceId: string;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(prompt.name);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleSave = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        if (tempName === "") {
            toast.error("New name cannot be empty");
            setIsEditing(false);
            setTempName(prompt.name);
            return;
        }

        const loading = toast.loading("Updating prompt name");
        try {
            await axiosInstance.post("/edit_prompt_name", { id: prompt.id, new_name: tempName, step, space_id: spaceId });
            toast.dismiss(loading);
            toast.success("Updated name");
            setPrompts((prevPrompts) =>
                prevPrompts.map((p) => (p.id === prompt.id ? { ...p, name: tempName } : p))
            );
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            toast.dismiss(loading);
            toast.error("Error updating name");
            setIsEditing(false);
        }
    };

    return (
        <li
            onClick={() => {
                if (activeId === prompt.id) return;
                setActiveId(prompt.id);
            }}
            className={`px-5 py-3 my-2 border-2 shadow-sm border-neutral-950 flex items-center justify-start gap-3 ${activeId === prompt.id ? "bg-neutral-950" : "cursor-pointer text-black"} rounded-3xl`}
        >
            {activeId === prompt.id && (
                <button onClick={handleEditClick}>
                    <PencilIcon width={15} height={15} />
                </button>
            )}
            {isEditing ? (
                <input
                    type="text"
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => {
                        setTempName(prompt.name);
                        setIsEditing(false);
                    }}
                    onKeyDown={handleSave}
                    className="bg-neutral-900 text-white px-2 py-1 rounded-md w-full"
                />
            ) : (
                <span>{prompt.name}</span>
            )}
            {prompt.active && <span className='bg-emerald-600 rounded-full w-2 h-2 ' />}
        </li>
    );
};
