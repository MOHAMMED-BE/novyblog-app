import api from "@/shared/api/api";
import { useApi } from "@mbs-dev/api-request";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RegisterPayload } from "types/auth";

export function useRegister() {
    const { apiCall } = useApi(api);
    const router = useRouter();

    return useMutation({
        mutationKey: ["auth", "register"],
        mutationFn: async (payload: RegisterPayload) => {
            const res = await apiCall({
                url: "/auth/register",
                method: "POST",
                data: payload,
                requiresAuth: false,
            });
            return res?.data;
        },
        onSuccess: () => {
            router.push("/auth/login");
            toast.success("Account created successfully");
        },
    });
}
