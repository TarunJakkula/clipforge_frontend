import { ZenKakuGothicAntiqueBold } from "@/ui/fonts";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import Tasks from "./components/_dashboard/Tasks";

export const metadata = {
    title: 'Home',
};


export default function Production() {
    return (
        <div className='bg-neutral-950 min-h-[calc(100vh-72px)] px-5 flex flex-1 2xl:flex-row flex-col 2xl:gap-10 gap-2 justify-center items-center text-neutral-50'>
            <div className="flex flex-col justify-center items-center gap-2">
                <Link href="/dashboard/production/upload" className="w-28 h-28 rounded-xl bg-neutral-800 flex justify-center items-center">
                    <PlusIcon width={50} height={50} />
                </Link>
                <div className="flex flex-col justify-center items-center text-center">
                    <span className={`${ZenKakuGothicAntiqueBold.className} text-neutral-50 desktop-h5`}>Click to upload</span>
                </div>
            </div>
            <Tasks />
        </div>
    )
}
