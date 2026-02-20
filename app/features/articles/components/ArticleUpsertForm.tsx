'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
    CircularProgress,
    FormHelperText,
} from '@mui/material';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { articleUpsertSchema, type ArticleUpsertValues } from '@/validation/articleSchemas';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { env } from '@/configs/env';

import type { Article } from 'types/article';
import { useCreateArticle, useUpdateArticle } from '@/features/author/hooks/useAuthor';
import { useCategories } from '@/features/categories/hooks/useCategories';

type Props = {
    mode: 'create' | 'edit';
    article?: Article | null;
};

export default function ArticleUpsertForm({ mode, article }: Props) {
    const router = useRouter();
    const isEdit = mode === 'edit';

    const createMutation = useCreateArticle();
    const updateMutation = useUpdateArticle(article?.id);

    const [fileName, setFileName] = useState<string>('');

    // Fetch categories for the select (increase size as needed)
    const categoriesQuery = useCategories(0, 200);
    const categories = categoriesQuery.data ?? [];

    const defaultValues = useMemo<ArticleUpsertValues>(() => {
        return {
            title: article?.title ?? '',
            excerpt: (article as unknown as { excerpt?: string })?.excerpt ?? '',
            content: article?.content ?? '',
            keywords: (article as unknown as { keywords?: string })?.keywords ?? '',
            status: (article?.status ?? 'DRAFT') as ArticleUpsertValues['status'],
            categoryId: (article as unknown as { categoryId?: number })?.categoryId ?? undefined,
            thumbnail: undefined,
        };
    }, [article]);

    const { control, handleSubmit, reset, formState } = useForm<ArticleUpsertValues>({
        resolver: zodResolver(articleUpsertSchema as any),
        defaultValues,
        mode: 'onTouched',
    });

    useEffect(() => {
        reset(defaultValues);
        setFileName('');
    }, [defaultValues, reset]);

    const busy = createMutation.isPending || updateMutation.isPending;

    const thumbnailPreview = useMemo(() => {
        const url = (article as unknown as { thumbnailUrl?: string })?.thumbnailUrl;
        return url ? `${env.uploadUrl}${url}` : undefined;
    }, [article]);

    const onSubmit = async (values: ArticleUpsertValues) => {
        const payload = {
            title: values.title,
            excerpt: values.excerpt || undefined,
            content: values.content,
            keywords: values.keywords || undefined,
            status: values.status,
            categoryId: values.categoryId,
            thumbnail: (values.thumbnail as File | undefined) ?? undefined,
        };

        try {
            if (!isEdit) {
                const created = await createMutation.mutateAsync(payload);
                toast.success('Article created');
                router.replace(created?.id ? `/author/articles/${created.id}/edit` : '/author/articles');
            } else {
                await updateMutation.mutateAsync(payload);
                toast.success('Article updated');
            }
        } catch (e: unknown) {
            const message =
                e && typeof e === 'object' && 'message' in e && typeof (e as { message?: unknown }).message === 'string'
                    ? (e as { message: string }).message
                    : 'Operation failed';
            toast.error(message);
        }
    };

    return (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Stack spacing={0.25}>
                            <Typography variant="h5" fontWeight={950}>
                                {isEdit ? 'Edit Article' : 'Create Article'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isEdit ? 'Update your article content and settings.' : 'Publish a new article for your readers.'}
                            </Typography>
                        </Stack>

                        <Button component={Link} href="/author/articles" variant="text" sx={{ fontWeight: 900 }}>
                            ← Back
                        </Button>
                    </Stack>

                    <Divider />

                    {isEdit ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip size="small" label={`ID: ${article?.id ?? '-'}`} />
                            <Chip size="small" label={`Slug: ${(article as unknown as { slug?: string })?.slug ?? '-'}`} />
                            <Chip size="small" label={`Status: ${article?.status ?? '-'}`} />
                        </Stack>
                    ) : null}

                    {createMutation.isError || updateMutation.isError ? (
                        <Alert severity="error">
                            {(createMutation.error as Error | null)?.message ||
                                (updateMutation.error as Error | null)?.message ||
                                'Request failed'}
                        </Alert>
                    ) : null}

                    {/* Thumbnail preview */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Stack spacing={1.5}>
                            <Typography fontWeight={900}>Thumbnail</Typography>

                            {thumbnailPreview ? (
                                <Box
                                    component="img"
                                    src={thumbnailPreview}
                                    alt="thumbnail"
                                    sx={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 2 }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        height: 160,
                                        borderRadius: 2,
                                        bgcolor: 'action.hover',
                                        display: 'grid',
                                        placeItems: 'center',
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        No thumbnail
                                    </Typography>
                                </Box>
                            )}

                            <Controller
                                control={control}
                                name="thumbnail"
                                render={({ field }) => (
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            disabled={busy}
                                            sx={{ fontWeight: 900, width: { xs: '100%', sm: 'auto' } }}
                                        >
                                            Choose file
                                            <input
                                                hidden
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    field.onChange(f ?? undefined);
                                                    setFileName(f?.name ?? '');
                                                }}
                                            />
                                        </Button>

                                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                            {fileName || 'PNG/JPG recommended (optional)'}
                                        </Typography>
                                    </Stack>
                                )}
                            />
                        </Stack>
                    </Box>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={2}>
                            <Controller
                                control={control}
                                name="title"
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Title"
                                        fullWidth
                                        disabled={busy}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message || ' '}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="excerpt"
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Excerpt (optional)"
                                        fullWidth
                                        disabled={busy}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message || ' '}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="content"
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Content"
                                        fullWidth
                                        multiline
                                        minRows={10}
                                        disabled={busy}
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message || ' '}
                                    />
                                )}
                            />

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Controller
                                    control={control}
                                    name="keywords"
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Keywords (optional)"
                                            fullWidth
                                            disabled={busy}
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message || ' '}
                                        />
                                    )}
                                />

                                {/* ✅ Category select */}
                                <Controller
                                    control={control}
                                    name="categoryId"
                                    render={({ field, fieldState }) => {
                                        const isLoading = categoriesQuery.isLoading;
                                        const isError = categoriesQuery.isError;

                                        return (
                                            <FormControl fullWidth disabled={busy || isLoading} error={!!fieldState.error}>
                                                <InputLabel id="category-label">Category (optional)</InputLabel>

                                                <Select
                                                    labelId="category-label"
                                                    label="Category (optional)"
                                                    value={typeof field.value === 'number' ? field.value : ''}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        // MUI Select returns string | number
                                                        if (String(v) === '') {
                                                            field.onChange(undefined);
                                                            return;
                                                        }
                                                        const asNumber = typeof v === 'number' ? v : Number(v);
                                                        field.onChange(Number.isFinite(asNumber) ? asNumber : undefined);
                                                    }}
                                                >
                                                    <MenuItem value="">
                                                        <em>None</em>
                                                    </MenuItem>

                                                    {categories.map((c) => (
                                                        <MenuItem key={c.id} value={c.id}>
                                                            {c.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>

                                                <FormHelperText>
                                                    {fieldState.error?.message ||
                                                        (isError ? 'Failed to load categories' : isLoading ? 'Loading categories…' : ' ')}
                                                </FormHelperText>
                                            </FormControl>
                                        );
                                    }}
                                />
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                                <Controller
                                    control={control}
                                    name="status"
                                    render={({ field, fieldState }) => (
                                        <FormControl fullWidth disabled={busy} error={!!fieldState.error}>
                                            <InputLabel id="status-label">Status</InputLabel>
                                            <Select {...field} labelId="status-label" label="Status">
                                                <MenuItem value="DRAFT">DRAFT</MenuItem>
                                                <MenuItem value="PUBLISHED">PUBLISHED</MenuItem>
                                            </Select>
                                            <FormHelperText>{fieldState.error?.message || ' '}</FormHelperText>
                                        </FormControl>
                                    )}
                                />
                            </Stack>

                            <Divider />

                            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                <Button type="button" variant="text" onClick={() => reset(defaultValues)} disabled={busy}>
                                    Reset
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={busy || !formState.isValid}
                                    startIcon={busy ? <CircularProgress size={16} /> : null}
                                    sx={{ fontWeight: 950 }}
                                >
                                    {isEdit ? 'Save changes' : 'Create article'}
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Stack>
            </Box>
        </Paper>
    );
}