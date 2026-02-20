'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from 'providers/ToastProvider';

export default function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ToastProvider theme="light" />
            {children}
        </AuthProvider>
    );
}
