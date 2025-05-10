"use client";

import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import axiosInstance from "@/util/axiosInstance";
import { Accordion, Tooltip } from "flowbite-react"
import { CheckIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import io from "socket.io-client"

type FlagProps = {
    uploaded: -1 | 0 | 1;
    transcribed: -1 | 0 | 1;
    stage1: -1 | 0 | 1;
    stage2: -1 | 0 | 1;
    stage3: -1 | 0 | 1;
};

type TaskProps = {
    title: string;
    task_id: string;
    flags: FlagProps;
};

type ProgressWidth = "w-1/4" | "w-2/4" | "w-3/4" | "w-4/4";

const calcProgress = (flags: FlagProps): ProgressWidth => {
    if (flags.stage2 === 1) return "w-4/4";
    if (flags.stage1 === 1) return "w-3/4";
    if (flags.transcribed === 1) return "w-2/4";
    return "w-1/4";
}

const hasBeenCompleted = (flags: FlagProps) => Object.values(flags).every(value => value === 1);

const hasBeenHalted = (flags: FlagProps) => Object.values(flags).some((value) => value === -1)

export default function Tasks() {
    const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace);
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<TaskProps[]>([]);

    const handleRestart = (task_id: string) => async () => {
        try {
            await axiosInstance.post("/task_restart", { task_id });
        } catch (e) {
            console.error(e);
            toast.error("Restart failed");
        }
    }

    const handleAbort = (task_id: string) => async () => {
        try {
            await axiosInstance.delete("/task_abort", { params: { task_id } });
        } catch (e) {
            console.error(e);
            toast.error("Abort failed");
        }
    }

    const fetchTasks = async (space_id: string | undefined) => {
        if (!space_id) return;
        try {
            const { data } = await axiosInstance.get("/fetch_tasks", { params: { space_id } });
            setTasks(data.tasks);
        } catch (e) {
            console.error(e);
            toast.error("Fetch failed");
        }
    }

    const handleUpdateTasks = useCallback((newTask: TaskProps) => setTasks(prevTasks => prevTasks.map(task => (task.task_id === newTask.task_id) ? newTask : task)), []);

    const handleNewTasks = useCallback(({ space_id, task }: { space_id: string, task: TaskProps }) => {
        if (space_id !== activeSpace?.space_id) return;
        setTasks((tasks) => [...tasks, task]);
    }, [activeSpace]);

    const handleDeleteTasks = useCallback((taskId: string) => setTasks((tasks) => tasks.filter((task) => task.task_id !== taskId)), []);

    const handleConnect = useCallback(() => {
        fetchTasks(activeSpace?.space_id);
        setLoading(false);
    }, [activeSpace]);

    const handleDisconnect = () => toast.error("Server disconnected!")

    useEffect(() => {
        if (!activeSpace) return;
        const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
            autoConnect: false,
            transports: ["websocket"],
            withCredentials: true
        });
        setLoading(true);
        socket.connect();

        socket.on("connect", handleConnect);
        socket.on("task_deleted", handleDeleteTasks);
        socket.on("task_added", handleNewTasks);
        socket.on("task_updated", handleUpdateTasks);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("task_deleted", handleDeleteTasks);
            socket.off("task_added", handleNewTasks);
            socket.off("task_updated", handleUpdateTasks);
            socket.off("disconnect", handleDisconnect);
            socket.disconnect();
        }
    }, [activeSpace])

    if (loading) {
        return <div className='flex justify-center items-center h-full max-h-[calc(100vh-500px)] max-w-[200px] flex-1'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" width={80} height={80}><path fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" strokeDasharray="300 385" strokeDashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"><animate attributeName="stroke-dashoffset" calcMode="spline" dur="2" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate></path></svg>
        </div>
    }

    return (
        <>
            {tasks.length !== 0 && <div className="w-full max-w-[800px] mt-10 max-h-[calc(100vh-500px)] md:pr-5 pr-1 flex flex-col gap-5 scrollbar-gutter overflow-y-auto ">
                {tasks.map((obj, index) => (
                    <Accordion key={obj.task_id} collapseAll={index !== 0} className="w-full border-none bg-neutral-900 rounded-2xl">
                        <Accordion.Panel>
                            <Accordion.Title className="hover:bg-transparent h-16 text-xl font-medium focus:border-none transition-colors text-white focus:!ring-0 focus:!ring-offset-0">
                                <span className="tracking-wider">
                                    {hasBeenHalted(obj.flags) &&
                                        <span className="mr-3 text-2xl font-bold text-red-500">
                                            !
                                        </span>
                                    }
                                    {hasBeenCompleted(obj.flags) &&
                                        <span className="mr-3 text-2xl font-bold text-emerald-500">
                                            &#10003;
                                        </span>
                                    }
                                    {obj.title}
                                </span>
                                {hasBeenCompleted(obj.flags) &&
                                    <button onClick={handleAbort(obj.task_id)} className="border ml-3 hover:bg-white hover:text-black transition-colors border-white text-xs py-1 px-2 rounded-md">
                                        Remove
                                    </button>
                                }
                            </Accordion.Title>
                            <Accordion.Content className="px-5 rounded-b-2xl pt-0 overflow-x-auto">
                                <div className="w-full overflow-x-auto flex flex-col gap-8 justify-center overflow-y-hidden">
                                    <div className="flex justify-between w-full relative">
                                        <div className="h-1 w-full bg-white  absolute left-0 top-[45%] rounded-xl" >
                                            <div className={`${calcProgress(obj.flags)} h-full rounded-xl bg-blue-600 `} />
                                        </div>
                                        {
                                            (Object.keys(obj.flags) as Array<keyof FlagProps>).map((key, index) => (
                                                <div key={obj.task_id + index} className="h-9 w-9 p-1 rounded-full bg-white z-[1] shadow-xl ">
                                                    <Tooltip content={key} className="bg-white text-black capitalize font-normal p-1" placement="right">
                                                        <div className={`${obj.flags[key] === -1 && "bg-neutral-800 "} ${obj.flags[key] === 0 && "bg-blue-500 p-2"} ${obj.flags[key] === 1 && "bg-emerald-500 p-1"} flex justify-center items-center w-7 h-7 rounded-full`}>
                                                            {obj.flags[key] === 0 && <div className="bg-white w-full h-full rounded-full" />}
                                                            {obj.flags[key] === 1 && <CheckIcon />}
                                                            {obj.flags[key] === -1 && <XIcon className="text-red-500" />}
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            ))
                                        }
                                    </div>
                                    {hasBeenHalted(obj.flags) && <div className="flex md:gap-5 gap-2 items-center">
                                        <button onClick={handleRestart(obj.task_id)} className="border hover:bg-white text-white hover:text-black transition-colors py-1 px-3 rounded-md">
                                            Restart
                                        </button>
                                        <button onClick={handleAbort(obj.task_id)} className="border hover:bg-red-500 transition-colors border-red-500 py-1 px-3 rounded-md">
                                            Abort
                                        </button>
                                    </div>}
                                </div>
                            </Accordion.Content>
                        </Accordion.Panel>
                    </Accordion>
                ))
                }
            </div>}
        </>
    )
}

