'use client';

import { Box, Button, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCreateArticleComment } from '@/features/articles/hooks/useArticles';
import { commentCreateSchema, CommentCreateValues } from '@/validation/commentSchemas';

type Props = {
    articleId?: number;
};

export default function CommentForm({ articleId }: Props) {
    const { user, isAuthenticated, tokenReady, userReady } = useAuthContext();
    const createComment = useCreateArticleComment(articleId);

    const { control, handleSubmit, reset, formState } = useForm<CommentCreateValues>({
        resolver: zodResolver(commentCreateSchema),
        defaultValues: { content: '' },
        mode: 'onTouched',
    });

    const canComment = tokenReady && userReady && isAuthenticated && !!user?.id;

    const onSubmit = async (values: CommentCreateValues) => {
        try {
            await createComment.mutateAsync(values);
            reset({ content: '' });
            toast.success('Comment posted');
        } catch (e: any) {
            toast.error(e?.message || 'Failed to post comment');
        }
    };

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
            }}
        >
            <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography variant="subtitle1" fontWeight={900}>
                        Add a comment
                    </Typography>

                    {!canComment ? (
                        <Chip size="small" label="Login required" variant="outlined" />
                    ) : (
                        <Chip size="small" label={user?.fullName || 'Authenticated'} variant="outlined" />
                    )}
                </Stack>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={1.5}>
                        <Controller
                            control={control}
                            name="content"
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    multiline
                                    minRows={3}
                                    maxRows={8}
                                    placeholder={
                                        canComment ? 'Write something helpful…' : 'You must be logged in to comment.'
                                    }
                                    disabled={!canComment || createComment.isPending}
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message || ' '}
                                    fullWidth
                                />
                            )}
                        />

                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                            <Button
                                type="button"
                                variant="text"
                                onClick={() => reset({ content: '' })}
                                disabled={createComment.isPending}
                            >
                                Clear
                            </Button>

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!canComment || createComment.isPending || !formState.isValid}
                                startIcon={createComment.isPending ? <CircularProgress size={16} /> : null}
                            >
                                Post comment
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Stack>
        </Box>
    );
}