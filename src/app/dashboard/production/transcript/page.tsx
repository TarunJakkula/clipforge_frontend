"use client";

import { useRouter, useSearchParams } from "next/navigation";
import VideoPlayer from "../components/VideoPlayer";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import {
  ZenKakuGothicAntiqueBold,
  ZenKakuGothicAntiqueMedium,
  ZenKakuGothicAntiqueRegular,
} from "@/ui/fonts";
import Image from "next/image";
import { arrowRight } from "@/ui/icons";
import axiosInstance from "@/util/axiosInstance";
import toast from "react-hot-toast";

type VideoDataProps = {
  clip_name: string;
  video_link: string;
  aspect_ratio: "shortform" | "longform";
}

export default function Transcript() {
  const params = useSearchParams();
  const router = useRouter();
  const clipId = params.get("clip_id");
  const [videoData, setVideoData] = useState<VideoDataProps | null>(null);
  const activeSpace = useAppSelector(
    (state: RootState) => state.spaces.activeSpace
  );
  const [loadingTranscript, setLoadingTranscript] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [loadingTrancriptStatus, setLoadingTranscriptStatus] = useState("Transcript");

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const redirectToUpload = () => {
    toast.error("Error Fetching Clip", { duration: 3000 });
    toast.loading("Redirecting You to upload", { duration: 4500 });
    router.replace("/dashboard/production/upload");
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const fetchTranscriptStatus = async (signal?: AbortSignal) => {
    const { data } = await axiosInstance.get("/get_transcript_status", {
      params: { clip_id: clipId },
      signal
    });
    return data.transcript_status;
  };

  const fetchTranscript = async (signal?: AbortSignal) => {
    try {
      const { data } = await axiosInstance.get("/get_clip_transcript", {
        params: { clip_id: clipId },
        signal
      });
      setTranscript(data.transcript);
      setLoadingTranscript(false);
      setLoadingTranscriptStatus("Transcript Ready");
    } catch (e: any) {
      if (!(e instanceof DOMException) && e.name !== 'AbortError') {
        console.error("Error fetching transcript:", e);
        redirectToUpload();
      }
    }
  };

  const getVideoData = async () => {
    try {
      const { data } = await axiosInstance.get<VideoDataProps>("/get_clip_info", { params: { clip_id: clipId } });
      setVideoData(data);
      checkTranscriptStatus();
    } catch (e: any) {
      console.error("Error fetching video data:", e);
      redirectToUpload();
    }
  };

  const startTranscriptPolling = () => {
    const statusMessages = [
      "Initializing transcript generation",
      "Processing audio data",
      "Extracting key phrases",
      "Refining transcription",
      "Finalizing transcript",
    ];

    let messageIndex = 0;

    // Store message interval
    messageIntervalRef.current = setInterval(() => {
      setLoadingTranscriptStatus(statusMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % statusMessages.length;
    }, 5000);

    // Create new AbortController for each polling cycle
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Store polling interval
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await fetchTranscriptStatus(signal);
        if (status) {
          await fetchTranscript(signal);
          stopPolling();
        }
      } catch (e: any) {
        if (!(e instanceof DOMException) && e.name !== 'AbortError') {
          console.error("Error during transcript polling:", e);
          stopPolling();
          redirectToUpload();
        }
      }
    }, 5000);
  };

  const checkTranscriptStatus = async () => {
    try {
      const transcriptExists = await fetchTranscriptStatus();
      if (transcriptExists) {
        await fetchTranscript();
      } else {
        const { data, status } = await axiosInstance.post("/transcript", { clip_id: clipId });
        if (status !== 202)
          toast.success(data.status, { duration: 3000 });
        else
          toast.loading("Transcript generation ongoing", { duration: 3000 });
        setTimeout(startTranscriptPolling, 2000)
      }
    } catch (e) {
      console.error("Error generating transcript:", e);
      redirectToUpload();
    }
  };

  const handleGenerate = (clip_id: string) => async () => {
    const loading = toast.loading("Process Started");
    try {
      await axiosInstance.post("/generate_clips", { clip_id, space_id: activeSpace?.space_id });
      toast.dismiss(loading);
      toast.success("Generating Clips");
    } catch (e) {
      toast.dismiss(loading);
      toast.error("Error genearting clips")
    }
  }

  useEffect(() => {
    if (!activeSpace) return router.replace("/dashboard/production");
    if (!clipId) return router.replace("/dashboard/production/upload");
    document.title = "Transcript";
    getVideoData();

    return () => {
      stopPolling();
    }
  }, [activeSpace, clipId, router]);


  return (
    <div className="flex-1 h-[calc(100vh-72px)] flex flex-col justify-center items-center bg-neutral-950 py-5 px-10 gap-5">
      <div className="flex justify-between items-center gap-5 w-full h-[80px]">
        <span className={`${ZenKakuGothicAntiqueBold.className} desktop-h6 text-neutral-50 line-clamp-1`}>Name : {videoData?.clip_name ?? "..."}</span>
        <button disabled={loadingTranscript}
          onClick={handleGenerate(clipId ?? "")}
          className={` flex justify-between disabled:bg-neutral-700 bg-neutral-900 px-5 py-2 h-fit w-fit items-center rounded-xl`}
        >
          <span
            className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline text-neutral-50`}
          >
            Generate Clips
          </span>
          <Image src={arrowRight} alt="arrow-right" />
        </button>
      </div>
      <div className="bg-neutral-900 flex flex-col gap-5 rounded-lg p-10 h-[calc(100%-90px)] w-full">
        <div className="flex flex-col items-center w-full gap-5">
          <div className="w-[400px]">
            <VideoPlayer src={videoData?.video_link ?? ""} aspectRatio={videoData?.aspect_ratio === "longform" ? "16/9" : "9/16"} />
          </div>
        </div>
        <div className={`w-full text-neutral-50 flex items-baseline justify-center ${!loadingTranscript && "flex-col justify-between"} gap-5 overflow-y-auto`}>
          {loadingTranscript ? (
            <>
              <span
                className={`${ZenKakuGothicAntiqueBold.className} text-white desktop-h5`}
              >
                {loadingTrancriptStatus}
              </span>
              <div className='loader h-fit' />
            </>
          ) : (
            <span className="flex flex-col justify-center gap-4 flex-1 scrollbar-gutter">
              <span
                className={`${ZenKakuGothicAntiqueBold.className} text-white desktop-h6 text-center`}
              >
                Transcript
              </span>
              <span
                className={`${ZenKakuGothicAntiqueRegular.className} desktop-tagline leading-relaxed`}
              >
                {transcript}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
