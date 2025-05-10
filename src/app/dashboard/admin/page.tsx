import { notFound } from "next/navigation";
import { cookies } from 'next/headers'
import SignupForm from "./components/SignupForm";
import SharedUsers from "./components/SharedUsers";
import { UsersProvider } from "./context/UserContext";

export const metadata = {
    title: 'Admin',
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function Admin() {
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken");
    const { isAdmin, user_id } = await (await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/check`,
        {
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token?.value}`
            },
            cache: "no-store",
        }
    )).json();

    if (!isAdmin)
        return notFound();

    return (
        <div className='bg-neutral-950 h-[calc(100vh-72px)] flex-wrap w-full p-5 gap-10 flex justify-center content-center items-center text-neutral-50'>
            <UsersProvider>
                <SignupForm user_id={user_id} />
                <SharedUsers />
            </UsersProvider>
        </div>
    );
}