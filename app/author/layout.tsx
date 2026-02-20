'use client';

import { PropsWithChildren } from 'react';
import AuthorGuard from '@/features/author/guards/AuthorGuard';
import AuthorShell from '@/features/author/components/AuthorShell';

export default function AuthorLayout({ children }: PropsWithChildren) {
    return (
        <AuthorGuard requiredRole="AUTHOR">
            <AuthorShell>{children}</AuthorShell>
        </AuthorGuard>
    );
}