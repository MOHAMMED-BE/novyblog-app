'use client';

import { Stack } from '@mui/material';
import ArticleUpsertForm from '@/features/articles/components/ArticleUpsertForm';

export default function NewArticlePage() {
    return (
        <Stack spacing={2}>
            <ArticleUpsertForm mode="create" />
        </Stack>
    );
}