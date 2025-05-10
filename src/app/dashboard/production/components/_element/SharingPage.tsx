import { ZenKakuGothicAntiqueBold } from '@/ui/fonts';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import ConfirmationDelete from './_sharingPage/ConfirmationDelete';
import { CheckCheckIcon, CrownIcon, Loader2Icon, PlusIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '@/util/axiosInstance';

type SharingScreenProps = {
    title: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
    objectId: string;
    spaceId: string;
    category: "broll" | "music"
}

export type SpacesDetailsProps = {
    space_id: string;
    space_name: string;
    owner: boolean
}

export default function SharingPage({ title, setOpen, objectId, spaceId, category }: SharingScreenProps) {
    const [email, setEmail] = useState("");
    const [sharedSpaces, setSharedSpaces] = useState<SpacesDetailsProps[]>([]);
    const [fetchedSpaces, setFetchedSpaces] = useState<SpacesDetailsProps[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [sharedSpacesIds, setSharedSpacesIds] = useState(new Set<string>());

    const handleSubmit = async () => {
        try {
            await axiosInstance.post("/grant_folder_access", { folder_id: objectId, space_id: spaceId, spaces: sharedSpaces, category });
            toast.success("Updated sharing info");
        } catch (e) {
            console.error(e);
            toast.error("Error updating info");
        } finally {
            setOpen(false);
        }
    }

    const handleAdd = (obj: SpacesDetailsProps) => () => {
        setSharedSpaces((spaces) => [...spaces, obj]);
    }

    const fetchSpaces = async (email: string) => {
        if (email === "") return;
        try {
            setLoading(true);
            const { data } = await axiosInstance.get("/fetch_spaces_of_user", { params: { email } });
            setFetchedSpaces(data.spaces);
            setLoading(false);
        } catch (e) {
            setLoading(false);
        }
    }

    useEffect(() => {
        const temp = new Set<string>();
        sharedSpaces.forEach((obj) => temp.add(obj.space_id));
        setSharedSpacesIds(temp);
    }, [sharedSpaces]);

    useEffect(() => setFetchedSpaces(null), [email])

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get("/fetch_shared_spaces_folders", { params: { folder_id: objectId, space_id: spaceId } });
                setSharedSpaces(data.spaces);
                setLoading(false)
            } catch (e) {
                console.error(e)
                toast.error("Error fetching shared spaces")
                setLoading(false);
            }
        }
        fetchSpaces();
    }, [])

    const handleDelete = (id: string) => setSharedSpaces(spaces => spaces.filter((obj) => obj.space_id !== id));

    return (
        <div className={`flex flex-col bg-transparent rounded-2xl pb-16 p-3 m-5 max-h-[400px] text-white overflow-y-auto ${ZenKakuGothicAntiqueBold.className} gap-5`}>
            <span className="text-white desktop-h6">Share "{title}"</span>
            <input value={email} type="email" onChange={(e) => setEmail(e.target.value)} className='bg-transparent text-white rounded-2xl border-white border px-4 py-3 placeholder:text-white w-[350px]' placeholder='Add email' />
            {
                email.length !== 0 && <div className='flex flex-1 gap-3'>
                    <button disabled={loading} onClick={() => fetchSpaces(email)} className='bg-white flex flex-1 text-black justify-center px-5 py-2 rounded-full disabled:bg-gray-400'>Fetch</button>
                    <button onClick={() => setEmail("")} className='bg-transparent border border-white flex flex-1 justify-center text-white px-5 py-2 rounded-full disabled:bg-gray-400'>Clear</button>
                </div>}
            {loading ?
                <div className='flex-1 flex justify-center'>
                    <Loader2Icon color="#fff" className="animate-spin" />
                </div>
                : (<>
                    {fetchedSpaces && <><span className="text-white mobile-h6">Spaces in {email}</span>
                        {fetchedSpaces.length === 0 ?
                            <span className='flex flex-1 justify-center items-center text-center'>No spaces</span>
                            : <ul>
                                {fetchedSpaces.map((obj) => {
                                    return <li key={obj.space_id} className='mx-5 mb-3 flex-1 flex justify-between items-center'>
                                        {obj.space_name}
                                        <button>
                                            {
                                                sharedSpacesIds.has(obj.space_id) ? <CheckCheckIcon width={18} height={18} className='text-emerald-500' />
                                                    : <PlusIcon width={18} height={18} onClick={handleAdd(obj)} />
                                            }
                                        </button>
                                    </li>
                                })
                                }
                            </ul>}
                    </>
                    }
                    <span className="text-white mobile-h6">Spaces with access</span>
                    {sharedSpaces.length === 0 ?
                        <span className='flex flex-1 justify-center items-center text-center'>No shared spaces</span>
                        :
                        <ul>
                            {sharedSpaces.map((obj) => {
                                return <li key={obj.space_id} className='mx-5 mb-3 flex-1 flex justify-between items-center '>
                                    {obj.space_name}
                                    {!obj.owner ? <ConfirmationDelete obj={obj} handleDelete={handleDelete} /> : <CrownIcon width={18} height={18} className='text-yellow-500' />}
                                </li>
                            })
                            }
                        </ul>}
                </>
                )}
            <div className='flex justify-end items-center gap-4 fixed bottom-0 w-full left-0 px-10 py-5 pt-10 from-[#26262600] via-neutral-800 to-neutral-800 bg-gradient-to-b rounded-2xl'>
                <button onClick={() => setOpen(false)} className='bg-transparent border-white border text-white px-5 py-2 rounded-full'>
                    Close
                </button>
                <button onClick={handleSubmit} className='bg-white text-black px-5 py-2 rounded-full'>
                    Send
                </button>
            </div>
        </div>
    )
}
