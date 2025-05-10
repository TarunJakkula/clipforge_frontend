
import { useEffect } from "react";
import { ZenKakuGothicAntiqueBold, ZenKakuGothicAntiqueMedium, ZenKakuGothicAntiqueRegular } from "@/ui/fonts";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Cross2Icon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation";
import { setActiveSpace } from "@/lib/features/spaces/spaceSlice";

export default function Container({ handleExit }: { handleExit: () => void }) {
    const spaces = useAppSelector((state: RootState) => state.spaces.spaces);
    const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace);
    const router = useRouter();
    const error = useAppSelector((state: RootState) => state.spaces.error);

    const dispatch = useAppDispatch();
    const handleProfileClick = (index: number) => () => {
        dispatch(setActiveSpace(spaces ? spaces[index] : null));
    };
    useEffect(() => {
        if (!spaces)
            return router.replace("/dashboard");
    }, [])

    if (error)
        return <span className={`${ZenKakuGothicAntiqueRegular.className} desktop-h5 w-full h-full bg-neutral-900 flex justify-center items-center text-rose-600 text-center uppercase`}>Error occured</span>;

    return (
        <div className="relative w-fit rounded-lg h-[60%] text-neutral-50 bg-white flex flex-col justify-center items-center gap-10 p-10">
            <div className={`bg-black h-8 w-8 rounded-full absolute top-5 right-6 flex justify-center items-center cursor-pointer ${!activeSpace && "hidden"}`} onClick={handleExit} ><Cross2Icon color="white" /></div>
            <div className='flex flex-col justify-center items-center gap-3'>
                <div className='flex flex-col gap-3 justify-center items-center'>
                    <span className={`${ZenKakuGothicAntiqueBold.className} desktop-h5 text-neutral-950`}>SPACES</span>
                    <span className={`${ZenKakuGothicAntiqueRegular.className} desktop-tagline text-neutral-900`}>These are the <span className={`${ZenKakuGothicAntiqueMedium.className}`}>SPACES</span> you have access to. </span>
                </div>
            </div>
            <div className='flex flex-col gap-3 max-h-[50%] overflow-y-auto'>
                {spaces && spaces.map((obj, index) =>
                    <button key={index} className={`${ZenKakuGothicAntiqueRegular.className} desktop-tagline rounded-xl px-4 py-2 w-[300px] min-h-[54px] capitalize`} onClick={handleProfileClick(index)} style={{ backgroundColor: obj.color }}>{obj.name}</button>
                )
                }
            </div>
        </div>
    )
}
