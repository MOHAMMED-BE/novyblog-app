"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

function createEmotionCache() {
    return createCache({ key: "mui", prepend: true });
}

const theme = createTheme({});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    const [cache] = React.useState(() => createEmotionCache());

    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </CacheProvider>
    );
}
