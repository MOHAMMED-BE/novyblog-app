'use client';

import * as React from 'react';
import { Box, Stack, Typography } from '@mui/material';

export function SectionHeader({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}) {
    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
            justifyContent="space-between"
        >
            <Stack spacing={0.5}>
                <Typography variant="h5" fontWeight={900}>
                    {title}
                </Typography>

                {subtitle ? (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                ) : null}
            </Stack>

            {action ? <Box>{action}</Box> : null}
        </Stack>
    );
}
