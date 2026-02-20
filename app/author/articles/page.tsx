'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    Alert,
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    TableContainer,
    TablePagination,
    CircularProgress,
} from '@mui/material';

import { useMemo, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAuthorArticles, useDeleteArticle } from '@/features/author/hooks/useAuthor';
import { toast } from 'sonner';
import { env } from '@/configs/env';

export default function AuthorArticlesPage() {
    const { user } = useAuthContext();

    const [q, setQ] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    const { data, isLoading, isError, error, refetch, isFetching } = useAuthorArticles(
        { q, size: 200, sort: 'createdAt,desc' },
        user?.id
    );

    const del = useDeleteArticle();

    const rows = data?.content ?? [];

    const paged = useMemo(() => {
        const start = page * rowsPerPage;
        return rows.slice(start, start + rowsPerPage);
    }, [rows, page, rowsPerPage]);

    const total = rows.length;

    const onDelete = async (id: number) => {
        try {
            await del.mutateAsync(id);
            toast.success('Article deleted');
        } catch (e: any) {
            toast.error(e?.message || 'Delete failed');
        }
    };

    return (
        <Stack spacing={2.5}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
            >
                <Stack spacing={0.25}>
                    <Typography variant="h5" fontWeight={950}>
                        My Articles
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your published and draft articles.
                    </Typography>
                </Stack>

                <Button component={Link} href="/author/articles/new" variant="contained" sx={{ fontWeight: 950 }}>
                    + New Article
                </Button>
            </Stack>

            <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ sm: 'center' }}
                    justifyContent="space-between"
                >
                    <TextField
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value);
                            setPage(0);
                        }}
                        placeholder="Search by title…"
                        size="small"
                        sx={{ width: { xs: '100%', sm: 360 } }}
                    />

                    <Stack direction="row" spacing={1} alignItems="center">
                        {isFetching && !isLoading ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CircularProgress size={16} />
                                <Typography variant="body2" color="text.secondary">
                                    Refreshing…
                                </Typography>
                            </Stack>
                        ) : null}

                        <Button variant="text" onClick={() => refetch()}>
                            Refresh
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {isError ? (
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => refetch()}>
                            Retry
                        </Button>
                    }
                >
                    {error?.message || 'Failed to load articles'}
                </Alert>
            ) : null}

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {/* ✅ New Thumbnail column */}
                                <TableCell sx={{ fontWeight: 950, width: 92 }}>Thumb</TableCell>

                                <TableCell sx={{ fontWeight: 950 }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 950 }} align="center">
                                    Status
                                </TableCell>
                                <TableCell sx={{ fontWeight: 950 }}>Slug</TableCell>
                                <TableCell sx={{ fontWeight: 950 }} align="right">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Box sx={{ p: 3, display: 'grid', placeItems: 'center' }}>
                                            <Stack spacing={1} alignItems="center">
                                                <CircularProgress />
                                                <Typography variant="body2" color="text.secondary">
                                                    Loading…
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : paged.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Box sx={{ p: 3, textAlign: 'center' }}>
                                            <Typography fontWeight={950}>No articles found</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                Create your first article to get started.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paged.map((a: any) => {
                                    return (
                                        <TableRow key={a.id} hover>
                                            {/* ✅ Thumbnail cell */}
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        width: 64,
                                                        height: 44,
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        bgcolor: 'action.hover',
                                                        position: 'relative',
                                                    }}
                                                >
                                                    {a?.thumbnailUrl ? (
                                                        <Image
                                                            src={`${env.uploadUrl}${a?.thumbnailUrl}`}
                                                            alt={`${a.title} thumbnail`}
                                                            fill
                                                            sizes="64px"
                                                            style={{ objectFit: 'cover' }}
                                                            priority={false}
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <Box sx={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                —
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Typography fontWeight={900} sx={{ lineHeight: 1.2 }}>
                                                    {a.title}
                                                </Typography>
                                                {a.excerpt ? (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                                        {String(a.excerpt).slice(0, 80)}
                                                        {String(a.excerpt).length > 80 ? '…' : ''}
                                                    </Typography>
                                                ) : null}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Chip size="small" label={a.status} />
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {a.slug}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                                                    <Button component={Link} href={`/author/articles/${a.id}/edit`} variant="outlined" size="small">
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        variant="text"
                                                        color="error"
                                                        size="small"
                                                        disabled={del.isPending}
                                                        onClick={() => onDelete(a.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 8, 10, 20]}
                />
            </Paper>
        </Stack>
    );
}