import { ZenKakuGothicAntiqueMedium } from '@/ui/fonts';
import { LoaderCircle, XIcon } from 'lucide-react';
import React, { Dispatch, SetStateAction, useState } from 'react'
import { ActionMeta, MultiValue } from 'react-select';
import CreatableSelect from "react-select/creatable";
import { ElementProps } from './Element';
import axiosInstance from '@/util/axiosInstance';
import toast from 'react-hot-toast';
import { changeTags as changeBrollTags } from '@/lib/features/brolls/brollSlice';
import { changeTags as changeMusicTags } from '@/lib/features/music/musicSlice';
import { useAppDispatch } from '@/lib/hooks';


type OptionType = {
    value: string;
    label: string;
};

const modifyTags = (tags: string[]) => tags.map((ele) => ({ value: ele, label: ele }));

const ConvertToArray = (tags: MultiValue<OptionType>) => tags.map((obj) => obj.value);

export default function ChangeTags({ setOpenModal, path, obj }: { setOpenModal: Dispatch<SetStateAction<boolean>>, path: string, obj: ElementProps }) {
    const [selectedOptions, setSelectedOptions] = useState<MultiValue<OptionType>>(modifyTags(obj?.tags ?? []));
    const [options, setOptions] = useState<OptionType[]>(modifyTags(obj?.tags ?? []));
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();

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

    const handleUpload = () => {
        setLoading(true);
        try {
            const tags = ConvertToArray(selectedOptions);
            axiosInstance.post("/edit_tags", { file_id: obj.id, category: path, tags });
            if (path === "broll")
                dispatch(changeBrollTags({ file: obj, tags }));
            if (path === "music")
                dispatch(changeMusicTags({ file: obj, tags }));
            setOpenModal(false);
            toast.success("Tags updated");
        } catch (e) {
            toast.error("Error updating Tags");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className={`h-screen w-screen fixed top-0 left-0 flex justify-center items-center backdrop-blur-sm z-[100] overflow-y-auto`}>
            <div className='h-full w-full bg-[#00000052]' onClick={() => setOpenModal(false)} />
            <form onSubmit={handleUpload} className='bg-white rounded-xl shadow-md w-[600px] absolute flex flex-col p-5 gap-5 m-10'>
                <div className='flex justify-between items-center'>
                    <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-h6`}>Change Tags</span>
                    {!loading && <button onClick={() => setOpenModal(false)} className='hover:bg-neutral-300 rounded p-1 transition-colors'><XIcon color="#000" /></button>}
                </div>
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
                <button type='submit' disabled={loading} className='rounded-lg p-4 cursor-pointer bg-blue-500 disabled:bg-neutral-400 px-8 text-white flex justify-center'>{!loading ? "Update Tags" : <LoaderCircle className='animate-spin w-5 h-5' />}</button>
            </form>
        </div>
    )
}
