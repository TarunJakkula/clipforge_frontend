import { deletePresetState } from "@/lib/features/presets/presetSlice";
import { useAppDispatch } from "@/lib/hooks";
import axiosInstance from "@/util/axiosInstance";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DeleteButton({
  presetId,
  spaceId,
}: {
  presetId: string | null;
  spaceId: string | undefined;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const handleDelete = async () => {
    if (presetId)
      if (confirm("Are you sure? This action cannot be undone")) {
        try {
          router.push("/dashboard/production");
          await axiosInstance.delete("/delete_preset", {
            params: {
              space_id: spaceId,
              preset_id: presetId,
            },
          });
          dispatch(deletePresetState({ presetId }));
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e: any) {
          toast.error("Error Deleting Preset");
        }
      }
  };

  return (
    <>
      {presetId && (
        <div className="flex justify-end items-center">
          <button
            onClick={handleDelete}
            className="flex justify-center w-fit items-center gap-2 py-2 px-4 rounded-md bg-[#f43f5e]"
          >
            <TrashIcon color="#fff" className="w-5 h-5" />
            Delete
          </button>
        </div>
      )}
    </>
  );
}
