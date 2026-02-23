"use client";

import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";

type Props = {
    theme?: "light" | "dark" | "system";
    position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
};

export const ToastProvider: React.FC<Props> = ({
    theme = "light",
    position = "top-right",
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null; //prevents SSR/client mismatch

    return (
        <Toaster
            theme={theme}
            position={position}
            richColors
            closeButton
            expand
            visibleToasts={4}
            toastOptions={{
                classNames: {
                    toast:
                        "rounded-xl shadow-lg ring-1 ring-black/5 text-white " +
                        "data-[type=error]:bg-red-600 data-[type=success]:bg-green-600 " +
                        "data-[type=warning]:bg-amber-500 data-[type=info]:bg-sky-600",
                    title: "font-semibold",
                    description: "text-sm leading-5/5 opacity-95",
                    actionButton:
                        "ml-2 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1 text-white",
                    cancelButton:
                        "ml-2 rounded-lg bg-black/10 hover:bg-black/20 px-2.5 py-1 text-white",
                    closeButton:
                        "text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 rounded-md",
                },
            }}
        />
    );
};
