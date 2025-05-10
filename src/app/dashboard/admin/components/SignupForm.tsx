"use client";

//custom code
import { ZenKakuGothicAntiqueBold, ZenKakuGothicAntiqueMedium } from "@/ui/fonts";
import { arrowRight, emailIcon } from "@/ui/icons";
import axiosInstance from "@/util/axiosInstance";

//libs
import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import OTPInput from "react-otp-input";
import toast from 'react-hot-toast';
import { useUsers } from "../context/UserContext";


export default function SignupForm({ user_id }: { user_id: string }) {
    const otpIdRef = useRef<string | null>(null)
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const { fetchUsers } = useUsers();

    const handleEmail = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            const { data } = await axiosInstance.post(`/admin/user_login`, { email });
            otpIdRef.current = data.otp_id;
            setEmailSent(true);
            toast.success("Email OTP sent to the user");
        }
        catch (e: any) {
            if (e.status === 422)
                toast.error("Invalid Mail");
            else if (e.status === 423)
                toast("Account already exists", {
                    icon: "❗"
                })
            else
                toast.error('Error Occured. Try again.')
            setEmail('');
        }
        finally {
            setLoading(false);
        }
    }

    const handleOtp = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            if (!otpIdRef.current)
                throw Error("No Otp Id Found");
            await axiosInstance.post(`/admin/verify_user`, { email, otp, otp_id: otpIdRef.current, user_id });
            setEmail('');
            setEmailSent(false);
            otpIdRef.current = null;
            fetchUsers();
            toast.success("Account Created");
        }
        catch (e: any) {
            if (e.status === 401)
                toast.error(e.response.data.detail, { duration: 4000 });
            else {
                toast.error('Error Occured. Try again.', { duration: 4000 });
                setEmail('');
                setEmailSent(false);
            }
        }
        finally {
            setOtp('');
            setLoading(false);
        }
    }

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            await axiosInstance.post(`/admin/user_login`, { email });
            setEmailSent(true);
            toast.success("Email OTP re-sent", { duration: 4000 });
        }
        catch (e: any) {
            if (e.status === 422)
                toast.error("Invalid Mail", { duration: 4000 });
            else if (e.status === 423)
                toast("Account already exists", {
                    icon: "❗"
                })
            else
                toast.error('Error Occured. Try again.', { duration: 4000 })
            setEmail('');
        }
        finally {
            setLoading(false);
        }
    }

    const handleReset = () => {
        setEmailSent(false);
        setLoading(false);
        setEmail("");
        setOtp("");
        otpIdRef.current = null;
    }

    return (
        <>
            <form className="max-w-[400px] w-full  flex flex-col justify-center items-center gap-5 text-black" onSubmit={emailSent ? handleOtp : handleEmail}>
                <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline text-left w-full text-neutral-50`}>Email :</span>
                <div className="w-full h-[72px] rounded-xl flex justify-between items-center px-5 gap-4 bg-neutral-50">
                    <Image src={emailIcon} alt="Email" />
                    {!emailSent ?
                        <input type="email" name="email" required autoComplete="on" className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline w-full focus:ring-0 focus:outline-none bg-neutral-50`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />
                        : <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline w-full focus:ring-0 focus:outline-none`}>{email}</span>
                    }
                </div>
                {emailSent && <>
                    <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline text-left w-full text-neutral-50`}>Otp: </span>
                    <OTPInput
                        value={otp}
                        shouldAutoFocus={true}
                        onChange={setOtp}
                        numInputs={6}
                        inputType="number"
                        renderInput={(props) => <input {...props} type="text" required style={{ width: 56, height: 60 }} className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline text-center focus:ring-0 focus:outline-none text-neutral-900 rounded-xl`} />}
                        containerStyle={{
                            display: "flex",
                            gap: 10,
                            justifyContent: "space-around",
                            width: "100%"
                        }}
                    />
                </>
                }
                <button type="submit" disabled={loading} className={` flex ${loading ? "justify-center bg-gray-500" : "justify-between bg-neutral-800"} px-5 items-center w-full h-[72px] rounded-xl`}>
                    {loading ?
                        <svg className="text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24">
                            <path
                                d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                                stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path
                                d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                                stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            </path>
                        </svg>
                        :
                        <>
                            <span className={`${ZenKakuGothicAntiqueMedium.className} desktop-tagline text-neutral-50`}>{emailSent ? "Verify Otp" : "Send Otp"}</span>
                            <Image src={arrowRight} alt="arrow-right" />
                        </>
                    }
                </button>
                {emailSent && <div className="w-full flex justify-between items-center p-2">
                    <button title="Reset back" className={`${ZenKakuGothicAntiqueBold.className} text-rose-500 desktop-tagline`} onClick={handleReset}> Wrong Email?</button>
                    <button title="Resend otp to mail" className={`${ZenKakuGothicAntiqueBold.className} text-blue-400 desktop-tagline`} onClick={handleResendOtp}>Resend OTP</button>
                </div>}
            </form>
        </>
    )
}
