import {
  ZenKakuGothicAntiqueBold,
  ZenKakuGothicAntiqueRegular,
} from "@/ui/fonts";
import LoginForm from "./components/LoginForm";

export const metadata = {
  title: "Login",
};

export default function Login() {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className=" bg-neutral-950 flex flex-1 flex-col justify-center items-center gap-7 ">
        <div className="flex flex-col gap-3 justify-center items-center">
          <span
            className={`${ZenKakuGothicAntiqueBold.className} desktop-h5 text-neutral-50`}
          >
            WELCOME TO CLIP FORGE
          </span>
          <span
            className={`${ZenKakuGothicAntiqueRegular.className} desktop-tagline text-neutral-300`}
          >
            LOG IN TO CONTINUE
          </span>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
