'use client';

import { useParams } from 'next/navigation';
import { Alert, Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import ArticleUpsertForm from '@/features/articles/components/ArticleUpsertForm';
import { useArticleById } from '@/features/author/hooks/useAuthor';

export default function EditArticlePage() {
    const params = useParams<{ id?: string }>();
    const id = params?.id ? Number(params.id) : undefined;

    const { data, isLoading, isError, error, refetch } = useArticleById(id);

    if (isLoading) {
        return (
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
                <Stack spacing={2}>
                    <Skeleton variant="text" height={42} width="55%" />
                    <Skeleton variant="rounded" height={180} />
                    <Skeleton variant="rounded" height={420} />
                </Stack>
            </Paper>
        );
    }

    if (isError) {
        return (
            <Alert
                severity="error"
                action={
                    <Button color="inherit" size="small" onClick={() => refetch()}>
                        Retry
                    </Button>
                }
            >
                {error?.message || 'Failed to load article'}
            </Alert>
        );
    }

    if (!data) {
        return (
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
                <Typography fontWeight={950}>Article not found</Typography>
            </Paper>
        );
    }

    return <ArticleUpsertForm mode="edit" article={data} />;
}