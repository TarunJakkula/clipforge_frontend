'use client'
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { ZenKakuGothicAntiqueBold, ZenKakuGothicAntiqueLight, ZenKakuGothicAntiqueMedium } from '@/ui/fonts';
import axiosInstance from '@/util/axiosInstance';
import { Popover } from 'flowbite-react';
import { ArrowLeft, ArrowRight, GalleryVerticalEndIcon, LoaderCircleIcon, PencilIcon, SaveIcon } from 'lucide-react';
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import PromptVersions from './components/PromptVersions';

export type PromptProps = {
  id: string;
  name: string;
  active: boolean
}

const isActivePrompt = (activeId: string | null, prompts: PromptProps[]) => prompts.find((obj) => activeId === obj.id)?.active ?? false

const stepBasedNextButtonText = (step: string) => {
  switch (step) {
    case "1": return "Clip Remixing Prompt";
    case "2": return "B-Roll Prompt";
    case "3": return "Music Prompt";
    default: null
  }
}

const stepBasedPrevButtonText = (step: string) => {
  switch (step) {
    case "2": return "Clip Remixing Prompt";
    case "3": return "B-Roll Prompt";
    case "4": return "Music Prompt";
    default: null
  }
}

const stepBasedText = (step: string) => {
  switch (step) {
    case "1": return "Viral Section Prompt";
    case "2": return "Clip Remixing Prompt";
    case "3": return "B-Roll Prompt";
    case "4": return "Music Prompt";
    default: null
  }
}

export default function page() {
  const params = useSearchParams();
  const step = params.get("step");
  const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [edit, setEdit] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<PromptProps[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (!activeSpace) return router.replace("/dashboard/production");
    if (!step) return router.replace("/dashboard/production/upload");
    if (step !== "1" && step != "2" && step != "3" && step != "4") notFound();
    document.title = "Prompts";
    const fetchPrompts = async () => {
      try {
        setActiveId(null);
        setLoadingPrompt(true);
        const { data } = await axiosInstance.get(`/fetch_prompts`, { params: { space_id: activeSpace.space_id, step } });
        setPrompts(data.data);
      } catch (e) {
        console.error(e)
        toast.error("Error fetching prompts");
        router.replace("/dashboard/production/clips");
      }
    }

    fetchPrompts();
  }, [step, activeSpace])

  useEffect(() => setActiveId(prompts.find((obj: PromptProps) => obj.active)?.id ?? null), [prompts])

  useEffect(() => {
    const fetchPrompt = async (activeId: string) => {
      try {
        setLoadingPrompt(true);
        const { data } = await axiosInstance.get(`/fetch_prompt`, { params: { space_id: activeSpace?.space_id, step, id: activeId } });
        setPrompt(data.prompt);
        setLoadingPrompt(false);
      } catch (e) {
        setLoadingPrompt(false);
        console.error(e)
        toast.error("Error fetching prompt");
      }
    }
    if (!activeId) return;
    fetchPrompt(activeId);
  }, [activeId])

  const handleNext = () => (step !== null && step !== "4") && router.replace(`/dashboard/production/prompts?step=${parseInt(step) + 1}`)

  const handlePrev = () => (step !== null && step !== "1") && router.replace(`/dashboard/production/prompts?step=${parseInt(step) - 1}`)

  const handleSetActive = (id: string, step: string, space_id: string) => async () => {
    const loading = toast.loading("Changing active prompt");
    try {
      const { data } = await axiosInstance.post("/set_active", { id, step, space_id });
      setPrompts(data.data);
      toast.dismiss(loading);
      toast.success("Changed active prompt");
    } catch (e) {
      console.error(e);
      toast.dismiss(loading);
      toast.error("Error setting active prompt")
    }
  }

  const handleSave = async () => {
    if (prompt === "")
      return toast.error("Please Don't leave the Prompt Blank");

    try {
      setLoading(true);
      const isActive = prompts.find((prompt) => prompt.id === activeId)?.active ?? false;
      await axiosInstance.post(`/update_prompt`, { id: activeId, new_prompt: prompt, space_id: activeSpace?.space_id, step, isActive });
      toast.success("Update success!");
      setLoading(false);
    } catch (e) {
      toast.error("Error Updating Prompt");
      setLoading(false);
    }
  }


  if (!step)
    return null;

  return <div className='h-[calc(100vh-72px)] p-5 pt-10 flex flex-1 flex-col items-center gap-5 overflow-y-auto'>
    <div className="max-w-[900px] w-full rounded-xl h-full flex flex-col items-center gap-5">
      <div className='flex justify-between items-end flex-wrap gap-5 w-full'>
        <div className='flex flex-col gap-3'>
          <div className='w-8 aspect-square flex justify-center items-center rounded-full bg-neutral-50'>
            <span className={`${ZenKakuGothicAntiqueBold.className} desktop-tagline text-black`}>{step}</span>
          </div>
          <span className={`${ZenKakuGothicAntiqueBold.className} desktop-h5 uppercase w-full text-neutral-50`}>{stepBasedText(step)}</span>
        </div>
        <div className='flex justify-center items-center gap-5'>
          {(!popoverOpen && !edit && !loading && !loadingPrompt && !isActivePrompt(activeId, prompts) && prompt) && <button onClick={handleSetActive(activeId ?? "", step, activeSpace?.space_id ?? "")} className={`hover:bg-white hover:text-black bg-neutral-900 text-white transition-colors uppercase rounded-lg p-[8px]  ${ZenKakuGothicAntiqueBold.className}`}>
            Set Active
          </button>}
          {(!edit && !loading && prompt) && <Popover
            arrow={false}
            placement='bottom-start'
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            content={<PromptVersions prompts={prompts} setPrompts={setPrompts} activeId={activeId} setActiveId={setActiveId} step={step} spaceId={activeSpace?.space_id ?? ""} />}
            className='focus:outline-none bg-neutral-100 rounded-3xl '
          >
            <div className={`${(popoverOpen || loadingPrompt) ? "bg-white" : "bg-blue-500 hover:scale-90"} transition-transform rounded-lg p-2 cursor-pointer`}>
              <GalleryVerticalEndIcon color={(popoverOpen || loadingPrompt) ? "#000000" : "#ffffff"} />
            </div>
          </Popover>}
          {(!popoverOpen && !loading && !loadingPrompt && prompt) && <button onClick={() => setEdit(state => !state)} className={`${edit ? "bg-white" : "bg-yellow-400"} hover:scale-90 transition-transform rounded-lg p-2`}>
            <PencilIcon color="#000000" />
          </button>}
          {(!popoverOpen && !edit && !loadingPrompt && prompt) && <button onClick={handleSave} disabled={loading} className={`bg-emerald-500 hover:scale-90 disabled:bg-white transition-transform rounded-lg p-2`} >
            {loading ? <LoaderCircleIcon className='animate-spin' /> : <SaveIcon />}
          </button>}
        </div>
      </div>
      <div className='w-full h-[2px] bg-neutral-100' />
      <div className=' p-5 h-full w-full text-neutral-50 bg-neutral-900 rounded-xl'>
        {loadingPrompt ?
          <LoaderCircleIcon className='animate-spin' color='#fff' />
          :
          prompt === null
            ? <span className={`w-full text-center ${ZenKakuGothicAntiqueBold.className} h-full flex items-center justify-center desktop-h5 uppercase `}>Error Fetching Prompt</span>
            : <textarea value={prompt} disabled={!edit} onChange={(e) => setPrompt(e.target.value)} className={`min-h-full w-full bg-transparent  ${ZenKakuGothicAntiqueLight.className} resize-none desktop-tagline md:p-5`} />}
      </div>
    </div>
    <div className='grid grid-cols-2 w-full max-w-[900px]'>
      <div className='flex justify-start'>
        {step !== "1" && <button disabled={loading || loadingPrompt || edit || popoverOpen} onClick={handlePrev} className={`w-fit flex justify-between transition-colors bg-neutral-900 disabled:bg-neutral-700 px-5 py-2 gap-3 items-center rounded-xl`}>
          <ArrowLeft color="#ffffff" />
          <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline text-neutral-50 md:block hidden`}>{stepBasedPrevButtonText(step)}</span>
        </button>}
      </div>
      <div className='flex justify-end'>
        {step !== "4" && <button disabled={loading || loadingPrompt || edit || popoverOpen} onClick={handleNext} className={`w-fit flex justify-between transition-colors bg-neutral-900 disabled:bg-neutral-700 px-5 py-2 gap-3 items-center rounded-xl`}>
          <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline text-neutral-50 md:block hidden`}>{stepBasedNextButtonText(step)}</span>
          <ArrowRight color='#ffffff' />
        </button>}
      </div>
    </div>
  </div>
}
