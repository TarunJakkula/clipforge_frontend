'use client';
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import Container from "./_modal/Container";
import { RootState } from "@/lib/store";
import { fetchSpaces, setModalState } from "@/lib/features/spaces/spaceSlice";
import { useEffect } from "react";

export default function Modal() {
    const showModal = useAppSelector((state: RootState) => state.spaces.showModal);
    const activeSpace = useAppSelector((state: RootState) => state.spaces.activeSpace);
    const dispatch = useAppDispatch();
    const uid = useAppSelector((state: RootState) => state.user.uid);
    const handleExit = () => {
        if (activeSpace)
            dispatch(setModalState(false))
    };
    const error = useAppSelector((state: RootState) => state.spaces.error);

    useEffect(() => {
        if (showModal && uid)
            dispatch(fetchSpaces(uid));
    }, [showModal])

    return (
        <div className={` h-screen w-screen fixed top-0 left-0 flex justify-center items-center ${!showModal && "hidden"} z-[50]`}>
            {!error && <div onClick={handleExit} className="absolute top-0 left-0 h-full w-full bg-black bg-opacity-80 flex justify-center items-center" />}
            <Container handleExit={handleExit} />
        </div>
    )
}
