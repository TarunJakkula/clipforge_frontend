import { Popover } from 'flowbite-react'
import { Trash2Icon } from 'lucide-react';
import React, { useState } from 'react'
import { SpacesDetailsProps } from '../SharingPage';

type ConfirmationDeleteProps = {
    obj: SpacesDetailsProps;
    handleDelete: (id: string) => void
}

export default function ConfirmationDelete({ obj, handleDelete }: ConfirmationDeleteProps) {
    const [open, setOpen] = useState(false);
    return (
        <Popover
            arrow={false}
            open={open}
            placement='top'
            className='bg-transparent'
            content={
                <div className='w-[470px] p-5 rounded-xl bg-neutral-900'>
                    <span>
                        Are you sure you want to remove access for&nbsp;
                        <span className='underline'>
                            {obj.space_name}
                        </span>?
                    </span>
                    <div className='flex gap-3 items-center mt-3'>
                        <button className='bg-transparent border border-white text-white px-5 py-1 rounded-full' onClick={() => setOpen(false)}>No</button>
                        <button className='bg-white text-black px-5 py-1 rounded-full' onClick={() => {
                            handleDelete(obj.space_id)
                            setOpen(false);
                        }}>Yes</button>
                    </div>
                </div>
            }
        >
            <Trash2Icon width={18} height={18} className='cursor-pointer' onClick={() => setOpen(true)} />
        </Popover>
    )
}
