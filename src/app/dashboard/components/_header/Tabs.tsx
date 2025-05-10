"use client";

import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { ZenKakuGothicAntiqueRegular } from "@/ui/fonts";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Tabs() {
    const pathname = usePathname();
    const is_admin = useAppSelector((state: RootState) => state.user.is_admin);

    const paths = [
        "production",
        // "schedule",
        // "accounts",
        // "boosting",
        // "analytics"
    ]

    return (
        <>
            {
                paths.map((path, index) =>
                    <Link href={`/dashboard/${path}`} key={index} className={`${ZenKakuGothicAntiqueRegular.className} capitalize text-center text-medium rounded-lg text-white px-4 py-1 ${pathname.includes(path) && "bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-30"}`}>{path}</Link>)
            }
            {is_admin && <Link href={`/dashboard/admin`} className={`${ZenKakuGothicAntiqueRegular.className} capitalize text-center text-medium rounded-lg text-white px-4 py-1 ${pathname.includes("admin") && "bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-30"}`}>Admin</Link>}
        </>
    )
}
