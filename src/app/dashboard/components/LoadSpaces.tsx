'use client'

import { usePersistor } from "@/app/StoreProvider";
import { fetchSpaces } from "@/lib/features/spaces/spaceSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logoutUser, RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react"

export default function LoadSpaces() {
    const dispatch = useAppDispatch();
    const uid = useAppSelector((state: RootState) => state.user.uid);
    const spaces = useAppSelector((state: RootState) => state.spaces.spaces);
    const router = useRouter();
    const persistor = usePersistor();
    useEffect(() => {
        if (uid)
            dispatch(fetchSpaces(uid));
        else {
            dispatch(logoutUser(persistor));
            router.replace("/flows");
        }
    }, [uid])

    useEffect(() => {
        if (spaces)
            router.replace("/dashboard/production");
    }, [spaces])

    return null
}
