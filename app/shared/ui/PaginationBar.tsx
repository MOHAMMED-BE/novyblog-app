'use client';

import * as React from 'react';
import {
    Stack,
    Pagination,
    Button,
    Typography,
    Paper,
    CircularProgress
} from '@mui/material';

type Props = {
    showPagination: boolean;
    pagesLoaded: number;
    totalPages: number;
    totalElements: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    selectedPage: number;
    onSelectPage: (page: number) => void;
    onLoadMore: () => void;
};

export function PaginationBar({
    showPagination,
    pagesLoaded,
    totalPages,
    totalElements,
    hasNextPage,
    isFetchingNextPage,
    selectedPage,
    onSelectPage,
    onLoadMore
}: Props) {
    if (pagesLoaded <= 0) return null;

    const safeTotalPages = Math.max(totalPages || 0, pagesLoaded);
    const safeSelected = Math.min(selectedPage, Math.max(safeTotalPages, 1));

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 3,
                p: 2
            }}
        >
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent="space-between"
            >
                <Stack spacing={0.5}>
                    <Typography fontWeight={800}>Pagination</Typography>

                    <Typography variant="body2" color="text.secondary">
                        Page {safeSelected} / {safeTotalPages}
                        {typeof totalElements === 'number' && totalElements > 0
                            ? ` • Total: ${totalElements}`
                            : ''}
                        {safeTotalPages !== pagesLoaded ? ` • Loaded: ${pagesLoaded}` : ''}
                    </Typography>
                </Stack>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems="center"
                    justifyContent="flex-end"
                >
                    {
                        showPagination ?
                            <Pagination
                                count={safeTotalPages}
                                page={safeSelected}
                                onChange={(_, p) => onSelectPage(p)}
                                color="primary"
                                shape="rounded"
                            />

                            : null
                    }

                    <Button
                        variant="contained"
                        onClick={onLoadMore}
                        disabled={!hasNextPage || isFetchingNextPage}
                        startIcon={isFetchingNextPage ? <CircularProgress size={16} /> : undefined}
                    >
                        {hasNextPage ? 'Load more' : 'No more'}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}
