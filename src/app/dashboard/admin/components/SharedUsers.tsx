"use client"

import axiosInstance from "@/util/axiosInstance"
import { useState } from "react"
import toast from "react-hot-toast";
import { useUsers } from "../context/UserContext";

enum Status {
    active = "bg-green-600",
    inactive = "bg-orange-400",
}


export default function SharedUsers() {
    const [actionDisable, setActionDisable] = useState(false);
    const { error, fetchUsers, loading, users } = useUsers();

    const handleDisable = (user_id: string) => async () => {
        setActionDisable(true);
        const loading = toast.loading("Disabling user");
        try {
            await axiosInstance.post("/admin/disable_user_access", { user_id });
            fetchUsers();
            setActionDisable(false);
            toast.dismiss(loading);
            toast.success("User disabled");
        } catch (e) {
            toast.dismiss(loading);
            toast("Error disabling account", {
                icon: "❗"
            })
            setActionDisable(false);
        }
    }

    const handleEnable = (user_id: string) => async () => {
        setActionDisable(true);
        const loading = toast.loading("Enabling user");
        try {
            await axiosInstance.post("/admin/enable_user_access", { user_id });
            fetchUsers();
            setActionDisable(false);
            toast.dismiss(loading);
            toast.success("User enabled");
        } catch (e) {
            toast.dismiss(loading);
            toast("Error enabling account", {
                icon: "❗"
            })
            setActionDisable(false);
        }
    }

    const handleDelete = (user_id: string) => async () => {
        setActionDisable(true);
        const loading = toast.loading("Deleting user");
        try {
            await axiosInstance.delete("/admin/remove_user", { params: { user_id } });
            fetchUsers();
            setActionDisable(false);
            toast.dismiss(loading);
            toast.success("Account Deleted");
        } catch (e) {
            toast.dismiss(loading);
            toast("Error deleting account", {
                icon: "❗"
            })
            setActionDisable(false);
        }
    }

    if (loading)
        return (<div className="max-h-[calc(100vh-72px)] flex flex-1 flex-col justify-center items-center max-w-[600px] gap-10 min-w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" width={80} height={80}><path fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" strokeDasharray="300 385" strokeDashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"><animate attributeName="stroke-dashoffset" calcMode="spline" dur="2" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate></path></svg>
        </div>)

    if (error)
        return null;

    if (users.length === 0)
        return null;

    return (
        <div className="max-h-[400px] flex flex-1 flex-col justify-center items-center max-w-[600px] md:gap-10 gap-5 min-w-fit">
            <span className="md:text-4xl text-2xl underline underline-offset-8">Accounts</span>
            <ul className="flex flex-col items-center w-full gap-2 overflow-auto">
                {users.map(({ user_id, access, email }) => {
                    return <li key={user_id} className=" bg-neutral-900 w-full flex-wrap gap-5 shadow-xl px-7 py-3 rounded-xl flex justify-between items-center">
                        <span className="flex items-center gap-5">
                            <div className={`w-2 h-2 rounded-full ${access ? Status.active : Status.inactive}`} />
                            {email}
                        </span>
                        <div className="space-x-5">
                            {!access && <button disabled={actionDisable} className="border rounded-lg px-2 py-1 hover:bg-emerald-600 hover:text-black hover:border-black transition-colors" onClick={handleEnable(user_id)}>Enable</button>}
                            {access && <button disabled={actionDisable} className="border rounded-lg px-2 py-1 hover:bg-orange-400 hover:text-black hover:border-black transition-colors" onClick={handleDisable(user_id)}>Disable</button>}
                            <button disabled={actionDisable} className="hover:text-red-500 transition-colors" onClick={handleDelete(user_id)}>Delete</button>
                        </div>
                    </li>
                })}
            </ul>
        </div>
    )
}
