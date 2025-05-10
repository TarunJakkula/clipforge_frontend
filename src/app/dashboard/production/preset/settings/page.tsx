"use client";
import React, { Fragment, useEffect, useState } from "react";
import { useSearchParams, useRouter, } from "next/navigation";
import { Accordion, Popover } from "flowbite-react";
import Masonry from "react-layout-masonry";
import toast from "react-hot-toast";
import { ColorPicker, ColorService, useColor } from "react-color-palette";
import "react-color-palette/css";
import axiosInstance from "@/util/axiosInstance";
import { DEFAULT_OPTIONS, ListItem, PRESET_OPTIONS } from "@/util/staticData";
import {
    ZenKakuGothicAntiqueBlack,
    ZenKakuGothicAntiqueBold,
    ZenKakuGothicAntiqueRegular,
} from "@/ui/fonts";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import type {
    OptionsProp,
    OptionValue,
} from "@/lib/features/presets/PresetTypes";
import {
    addNewPreset,
    setPresetState,
} from "@/lib/features/presets/presetSlice";
import DeleteButton from "../components/DeleteButton";
import { Loader2Icon, SaveIcon, Link2Icon, TriangleAlertIcon, SettingsIcon } from "lucide-react";
import Image from "next/image";
import { instagram, tiktok, x, youtube } from "@/ui/icons";
import SharingPage from "../components/SharingPage";

const formatText = (text: string, seperator: "-" | "_", joinSeperator: " " | ":") => text.split(seperator).join(joinSeperator);

export default function PresetPage() {
    const params = useSearchParams();
    const presetId = params.get("preset_id");
    const presets = useAppSelector((state: RootState) => state.presets.presets);
    const router = useRouter();
    const activeSpace = useAppSelector(
        (state: RootState) => state.spaces.activeSpace
    );
    const dispatch = useAppDispatch();
    const [name, setName] = useState<string>("Untitled");
    const [options, setOptions] = useState<OptionsProp>(DEFAULT_OPTIONS);
    const [color, setColor] = useColor("#ff0000");
    const [loading, setLoading] = useState(false);
    const [mediaIds, setMediaIds] = useState<{ insta: string | null; youtube: string | null; tiktok: string | null; x: string | null; }>({ insta: null, youtube: null, tiktok: null, x: null });
    const [activeMedia, setActiveMedia] = useState<"insta" | "youtube" | "tiktok" | "x">("insta");
    const [errorStatus, setErrorStatus] = useState(200);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!activeSpace) return router.replace("/dashboard/production");
        document.title = "Presets - Settings";
        if (presetId && presets) {
            const newPreset = presets.find((ele) => ele.preset_id === presetId);
            if (!newPreset?.isOwner) return router.replace(`/dashboard/production/preset?preset_id=${newPreset?.preset_id}`);
            if (newPreset) {
                setErrorStatus(200)
                setName(newPreset.name);
                setOptions(newPreset.options);
                setColor(ColorService.convert("hex", newPreset.color));
                setMediaIds(newPreset.media_ids ?? { insta: null, youtube: null, tiktok: null, x: null });
            } else {
                setErrorStatus(403);
            }
        } else {
            setName("Untitled");
            setOptions(DEFAULT_OPTIONS);
            setColor(ColorService.convert("hex", "#ff0000"));
        }
    }, [presetId, activeSpace, presets, setColor, router]);

    const handleCreatePreset = async () => {
        if (name === "") return toast.error("Preset name not provided");
        const isFilled = Object.keys(options).every(
            (key) => options[key as keyof OptionsProp] !== null
        );
        if (!isFilled) return toast.error("Select all the preset values");
        try {
            const payload = {
                name,
                options,
                color: color.hex,
                space_id: activeSpace?.space_id,
                media_ids: mediaIds
            };
            setLoading(true);
            const { data } = await axiosInstance.post("/create_preset", payload);
            setLoading(false);
            dispatch(addNewPreset({
                presetId: data.preset_id,
                preset: {
                    name,
                    color: color.hex,
                    options,
                    mediaIds,
                    isOwner: true
                }
            }));
            toast.success("Preset Created");
            router.replace(`/dashboard/production/preset?preset_id=${data.preset_id}`);
        } catch (e) {
            console.error(e);
            toast.error("Error creating preset");
        }
    };

    const handleUpdatePreset = async () => {
        if (name === "") return toast.error("Preset name not provided");
        try {
            const payload = {
                name,
                options,
                color: color.hex,
                space_id: activeSpace?.space_id,
                preset_id: presetId,
                media_ids: mediaIds
            };
            setLoading(true);
            await axiosInstance.post("/update_preset", payload);
            setLoading(false);
            if (activeSpace && presetId)
                dispatch(
                    setPresetState({
                        presetId,
                        preset: {
                            name,
                            color: color.hex,
                            options,
                            mediaIds
                        },
                    })
                );
        } catch (e) {
            console.error(e);
            toast.error("Error updating preset");
        }
    };


    const handleOptionChange = (id: keyof OptionsProp, value: OptionValue) =>
        setOptions((prev) => ({
            ...prev,
            [id]: value,
        }));

    if (!presets)
        return <div className="w-full h-full flex justify-center items-center">
            <svg className="w-16 h-16 animate-spin text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z" />
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </svg>

        </div>

    if (errorStatus === 403)
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <TriangleAlertIcon className="w-[50px] h-auto aspect-square" color="#ff1234" />
                <span className={` text-white ${ZenKakuGothicAntiqueRegular.className} desktop-h6`}>
                    403 Forbidden
                </span>
            </div>
        )


    return (
        <div className="w-full h-full bg-neutral-950 flex flex-col items-center text-neutral-50 px-10 py-5 gap-10 overflow-y-auto scrollbar-gutter">
            <div className="flex justify-between flex-wrap gap-5 items-center w-full">
                <div className="flex items-baseline gap-5 ">
                    <Popover
                        className="bg-neutral-900 rounded-lg z-10"
                        placement="right-end"
                        content={
                            <div className="p-2">
                                <ColorPicker color={color} onChange={setColor} />
                            </div>
                        }
                    >
                        <div
                            style={{ backgroundColor: color.hex + "" }}
                            className="h-8 w-8 rounded-lg cursor-pointer"
                        />
                    </Popover>
                    <input
                        value={name}
                        placeholder="Enter Value"
                        className={`${ZenKakuGothicAntiqueBold.className} w-8/12 desktop-h4 bg-transparent focus:outline-none`}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Popover placement="auto" className="rounded-none" arrow={false} content={
                        <div className="w-[300px] bg-white rounded-2xl px-5 py-5 grid gap-5">
                            <span className={`${ZenKakuGothicAntiqueBlack.className} text-center desktop-h6 text-blue-500`}>Media IDs</span>
                            <div className="flex gap-3 items-center">
                                <Image src={instagram} alt="Instagram" onClick={() => setActiveMedia("insta")} className={`w-12 h-12 object-contain border-2 transition-all cursor-pointer ${mediaIds.insta && "bg-rose-100"} ${activeMedia === "insta" ? "border-blue-500" : "border-gray-100"}  rounded-xl p-2`} />
                                <Image src={youtube} alt="Youtube" onClick={() => setActiveMedia("youtube")} className={`w-12 h-12 object-contain border-2 transition-all select-none cursor-pointer ${mediaIds.youtube && "bg-indigo-100"} ${activeMedia === "youtube" ? "border-blue-500" : "border-gray-100"}  rounded-xl p-2`} />
                                <Image src={tiktok} alt="Tiktok" onClick={() => setActiveMedia("tiktok")} className={`w-12 h-12 object-contain border-2 transition-all cursor-pointer ${mediaIds.tiktok && "bg-yellow-100"} ${activeMedia === "tiktok" ? "border-blue-500" : "border-gray-100"}  rounded-xl p-2`} />
                                <Image src={x} alt="X" onClick={() => setActiveMedia("x")} className={`w-12 h-12 object-contain border-2 transition-all cursor-pointer ${mediaIds.x && "bg-purple-100"} ${activeMedia === "x" ? "border-blue-500" : "border-gray-100"}  rounded-xl p-2`} />
                            </div>
                            <label htmlFor={activeMedia} className={`capitalize bg-transparent rounded-md flex flex-col w-full gap-2 desktop-h6 text-black`}>
                                <input type="text" value={mediaIds[activeMedia] ?? ""} id={activeMedia} onChange={(e) => setMediaIds(state => ({ ...state, [activeMedia]: e.target.value === "" ? null : e.target.value }))} required placeholder={`E.g. @${activeMedia}`} autoFocus className='focus:outline-none w-full flex-1 p-4 border-2 border-gray-200 focus:border-black transition-all rounded-lg text-small bg-transparent' />
                            </label>
                        </div>
                    }>
                        <button title="Add Social Media Accounts" className={` flex justify-center bg-white disabled:bg-neutral-500 py-2 px-3 gap-2 items-center rounded-xl text-black`}><Link2Icon className="w-5 h-5" /></button>
                    </Popover>
                    {presetId && <Popover
                        key={presetId}
                        arrow={false}
                        open={open}
                        placement="right"
                        content={
                            <SharingPage title={name} setOpen={setOpen} presetId={presetId} spaceId={activeSpace?.space_id ?? ""} />
                        }
                        className="bg-neutral-800 rounded-2xl"
                    >
                        <span onClick={() => setOpen(state => !state)} className={` gap-2 ${ZenKakuGothicAntiqueRegular.className} cursor-pointer desktop-tagline flex justify-center bg-yellow-400 text-black disabled:bg-neutral-500 px-4 py-2 items-center rounded-lg`}><SettingsIcon className="w-5 h-5" />Share</span>
                    </Popover>}
                    <button
                        onClick={presetId ? handleUpdatePreset : handleCreatePreset}
                        disabled={loading}
                        className={` flex justify-center bg-blue-500 disabled:bg-neutral-500 px-4 py-2 items-center rounded-lg`}
                    >
                        {loading ?
                            <Loader2Icon color="#fff" className="animate-spin" />
                            : <span className={`flex items-center gap-2 ${ZenKakuGothicAntiqueRegular.className} desktop-tagline`}><SaveIcon className="w-5 h-5" />Save</span>}
                    </button>
                    <DeleteButton presetId={presetId} spaceId={activeSpace?.space_id} />
                </div>
            </div>
            <Masonry columns={{ 768: 1, 920: 2, 1224: 3, 1500: 4, 1800: 5 }} gap={16} className="w-full">
                {PRESET_OPTIONS.map((item) => (
                    <Fragment key={presetId + item.id}>
                        {presetSettingComponent(item, options, handleOptionChange)}
                    </Fragment>
                ))}
            </Masonry>
        </div>
    );
}



const presetSettingComponent = (item: ListItem, options: OptionsProp, handleOptionChange: (id: keyof OptionsProp, value: OptionValue) => void) => {
    switch (item.id) {
        // Toggle
        case "brollToggle":
        case "fontCapitalization":
            return <div
                className="border-none bg-neutral-900 flex justify-between p-4 px-5 items-center h-16 rounded-2xl">
                <span className="hover:bg-transparent line-clamp-1 text-white">
                    <span className="capitalize">{item.title}</span>
                </span>
                <div onClick={() => handleOptionChange(item.id, !options[item.id])} className={` cursor-pointer w-10 h-6 p-1 bg-gray-200  rounded-full`} >
                    <div className={`${options[item.id] && " bg-blue-600 translate-x-full"} bg-black rounded-full h-4 w-4 transition-all`} />
                </div>
            </div>;
        // Number input
        case "scaling":
            return <div
                className="border-none bg-neutral-900 flex justify-between p-4 px-5 items-center h-16 rounded-2xl">
                <span className="hover:bg-transparent line-clamp-1 text-white">
                    <span className="capitalize">{item.id}</span>
                </span>
                <div className="flex items-center max-w-[8rem]">
                    <button type="button" className="group bg-transparent border hover:bg-white transition-colors border-neutral-600 rounded-lg p-3 " onClick={() => handleOptionChange(item.id, Math.max(options["scaling"] - 1, 100))}>
                        <svg className="w-3 h-3 text-white group-hover:text-black transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16" />
                        </svg>
                    </button>
                    <input type="number" value={options.scaling} id="scaling" onChange={(e) => handleOptionChange(item.id, parseInt(e.target.value === "" ? "100" : e.target.value))} onBlur={() => handleOptionChange(item.id, Math.min(200, Math.max(100, options.scaling)))} className="focus:outline-none bg-transparent border-neutral-600 h-11 text-center text-white text-sm block w-full py-2.5 " />
                    <button type="button" className="group bg-transparent border hover:bg-white transition-colors border-neutral-600 rounded-lg p-3 " onClick={() => handleOptionChange(item.id, Math.min(options["scaling"] + 1, 200))}>
                        <svg className="w-3 h-3 text-white group-hover:text-black transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                        </svg>
                    </button>
                </div>
            </div>;
        // Color popup
        case "backgroundColor":
        case "fontColor":
        case "glowColor":
        case "strokeColor":
            return <Popover
                placement="auto"
                className="bg-neutral-900 rounded-xl"
                content={
                    <div className="p-2 rounded-xl bg-neutral-900">
                        <ColorPicker hideInput={["rgb", "hsv"]} color={ColorService.convert("hex", options[item.id])} onChange={(e) => handleOptionChange(item.id, e.hex)} />
                    </div>
                }>
                <div
                    className="border-none bg-neutral-900 flex justify-between p-4 px-5 items-center h-16 rounded-2xl cursor-pointer">
                    <span className="hover:bg-transparent line-clamp-1 text-white">
                        {options[item.id] &&
                            <span className="capitalize">{item.id}</span>
                        }
                    </span>
                    <div
                        style={{ backgroundColor: options[item.id] }}
                        className="h-5 w-8 rounded-md"
                    />
                </div>
            </Popover>;
        // Accordion list
        default:
            return <Accordion
                className="w-full border-none bg-neutral-900 rounded-2xl"
                collapseAll
            >
                <Accordion.Panel>
                    <Accordion.Title className="hover:bg-transparent capitalize flex h-16  focus:border-none transition-colors text-white focus:!ring-0 focus:!ring-offset-0" >
                        <span className={`${options[item.id] && "font-black"} line-clamp-1`}>
                            {options[item.id] && <span className="text-white font-normal">{item.id} : </span>}
                            {options[item.id] ? formatText(`${options[item.id]}`, item.id === "font" ? "-" : "_", item.id === "aspectRatio" ? ":" : " ") : item.title}
                        </span>
                    </Accordion.Title>
                    <Accordion.Content className="p-1 pb-2 max-h-[350px] mr-2 mb-4 overflow-y-auto">
                        <div className="flex flex-col gap-1">
                            {item.options && item.options.map((option, optionIndex) => (
                                <button
                                    key={optionIndex}
                                    title={`${option.title}`}
                                    onClick={() => handleOptionChange(item.id, option.title)}
                                    className={`text-neutral-50 line-clamp-1 text-left px-3 py-1 m-1 capitalize transition-all rounded-lg ${options[item.id] === option.title
                                        ? "bg-neutral-50 text-neutral-950"
                                        : "hover:bg-neutral-900"
                                        }`}
                                >
                                    {formatText(`${option.title}`, (item.id === "font" || item.id === "fontPosition") ? "-" : "_", item.id === "aspectRatio" ? ":" : " ")}
                                </button>
                            ))}
                        </div>
                    </Accordion.Content>
                </Accordion.Panel>
            </Accordion>;
    }
}