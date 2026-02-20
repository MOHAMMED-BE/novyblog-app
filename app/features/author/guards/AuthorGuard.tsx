'use client';

import { PropsWithChildren, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useAuthContext } from '@/contexts/AuthContext';

type Props = PropsWithChildren<{
    requiredRole?: 'AUTHOR';
}>;

export default function AuthorGuard({ children, requiredRole = 'AUTHOR' }: Props) {
    const router = useRouter();
    const { tokenReady, userReady, isAuthenticated, user } = useAuthContext();

    const ready = tokenReady && userReady;

    const hasRole = useMemo(() => {
        if (!user?.roles?.length) return false;
        return user.roles.includes(requiredRole);
    }, [user?.roles, requiredRole]);

    useEffect(() => {
        if (!ready) return;

        if (!isAuthenticated) {
            router.replace('/auth/login');
            return;
        }

        if (!hasRole) {
            router.replace('/articles');
        }
    }, [ready, isAuthenticated, hasRole, router]);

    if (!ready) {
        return (
            <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
                <Stack spacing={1} alignItems="center">
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                        Loading…
                    </Typography>
                </Stack>
            </Box>
        );
    }

    if (!isAuthenticated || !hasRole) {
        return (
            <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, maxWidth: 520 }}>
                    <Stack spacing={1}>
                        <Typography variant="h6" fontWeight={900}>
                            Access denied
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            This area is restricted to AUTHOR accounts.
                        </Typography>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    return <>{children}</>;
}