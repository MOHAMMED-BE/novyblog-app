'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Paper,
    Skeleton,
    Stack,
    Typography
} from '@mui/material';

import { env } from '@/configs/env';
import { useArticleBySlug, useArticleComments } from '@/features/articles/hooks/useArticles';
import CommentForm from '@/features/comments/components/CommentForm';

function formatDate(iso?: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
    }).format(d);
}

// Simple “time ago” formatter (no extra deps)
function timeAgo(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    const ts = d.getTime();
    if (Number.isNaN(ts)) return '';

    const diffMs = Date.now() - ts;
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) return `${diffWeeks}w ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y ago`;
}

function initials(name?: string) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (first + last).toUpperCase() || '?';
}

export default function ArticleDetailsPage() {
    const params = useParams<{ slug?: string }>();
    const slug = typeof params?.slug === 'string' ? params.slug : undefined;

    const {
        data: article,
        isLoading: isArticleLoading,
        isError: isArticleError,
        error: articleError,
        refetch: refetchArticle,
        isFetching: isArticleFetching
    } = useArticleBySlug(slug);

    const articleId = article?.id;

    const {
        data: comments,
        isLoading: isCommentsLoading,
        isError: isCommentsError,
        error: commentsError,
        refetch: refetchComments,
        isFetching: isCommentsFetching
    } = useArticleComments(articleId);

    const imageSrc = article?.thumbnailUrl ? `${env.uploadUrl}${article.thumbnailUrl}` : undefined;
    const publishedLabel = formatDate(article?.publishedAt ?? null);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={2.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Link href="/articles" style={{ textDecoration: 'none' }}>
                        <Button variant="text" size="small" sx={{ fontWeight: 800 }}>
                            ← Back
                        </Button>
                    </Link>

                    {isArticleFetching && !isArticleLoading ? (
                        <Typography variant="body2" color="text.secondary">
                            Refreshing…
                        </Typography>
                    ) : null}
                </Stack>

                {isArticleError ? (
                    <Alert
                        severity="error"
                        action={
                            <Button color="inherit" size="small" onClick={() => refetchArticle()}>
                                Retry
                            </Button>
                        }
                    >
                        {articleError?.message || 'Failed to load article.'}
                    </Alert>
                ) : null}

                {isArticleLoading ? (
                    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }} aria-busy="true">
                        <Skeleton variant="rectangular" height={280} />
                        <Box sx={{ p: 3 }}>
                            <Skeleton variant="text" height={42} width="70%" />
                            <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2 }}>
                                <Skeleton variant="rounded" height={28} width={92} />
                                <Skeleton variant="rounded" height={28} width={92} />
                            </Stack>
                            <Skeleton variant="text" height={22} width="40%" />
                            <Skeleton variant="text" height={18} width="95%" sx={{ mt: 2 }} />
                            <Skeleton variant="text" height={18} width="92%" />
                            <Skeleton variant="text" height={18} width="88%" />
                        </Box>
                    </Paper>
                ) : article == null ? (
                    <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
                        <Stack spacing={1.5}>
                            <Typography variant="h6" fontWeight={900}>
                                Article not found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                We couldn’t find an article for this slug.
                            </Typography>
                            <Box>
                                <Link href="/articles" passHref legacyBehavior>
                                    <Button component="a" variant="contained" size="small">
                                        Go back to list
                                    </Button>
                                </Link>
                            </Box>
                        </Stack>
                    </Paper>
                ) : (
                    <>
                        {/* Article card */}
                        <Paper
                            variant="outlined"
                            sx={{ borderRadius: 3, overflow: 'hidden' }}
                            aria-busy={isArticleFetching ? 'true' : 'false'}
                        >
                            {imageSrc ? (
                                <Box
                                    component="img"
                                    src={imageSrc}
                                    alt={article.title}
                                    sx={{
                                        width: '100%',
                                        height: 320,
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        height: 220,
                                        bgcolor: 'action.hover',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        No thumbnail
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ p: 3 }}>
                                <Stack spacing={1.5}>
                                    <Typography variant="h4" fontWeight={950} sx={{ lineHeight: 1.15 }}>
                                        {article.title}
                                    </Typography>

                                    {article.excerpt ? (
                                        <Typography variant="body1" color="text.secondary">
                                            {article.excerpt}
                                        </Typography>
                                    ) : null}

                                    <Divider sx={{ my: 1 }} />

                                    <Box
                                        sx={{
                                            '& h1, & h2, & h3': { fontWeight: 900, lineHeight: 1.2 },
                                            '& p': { lineHeight: 1.8, mb: 1.5 },
                                            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2 },
                                            '& a': { color: 'primary.main', fontWeight: 700 },
                                            '& pre': {
                                                overflowX: 'auto',
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: 'action.hover'
                                            },
                                            '& code': {
                                                fontFamily:
                                                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: typeof article.content === 'string' ? article.content : ''
                                        }}
                                    />
                                </Stack>
                            </Box>
                        </Paper>

                        {/* Comments section */}
                        <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 3 } }}>
                            <Stack spacing={2}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                    <Typography variant="h6" fontWeight={950}>
                                        Comments
                                    </Typography>

                                    {isCommentsFetching && !isCommentsLoading ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Refreshing…
                                        </Typography>
                                    ) : (
                                        <Button variant="text" size="small" onClick={() => refetchComments()}>
                                            Refresh
                                        </Button>
                                    )}
                                </Stack>

                                {/* ✅ extracted component */}
                                <CommentForm articleId={articleId} />

                                {isCommentsError ? (
                                    <Alert
                                        severity="error"
                                        action={
                                            <Button color="inherit" size="small" onClick={() => refetchComments()}>
                                                Retry
                                            </Button>
                                        }
                                    >
                                        {commentsError?.message || 'Failed to load comments.'}
                                    </Alert>
                                ) : null}

                                {isCommentsLoading ? (
                                    <Stack spacing={1.5}>
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'divider'
                                                }}
                                            >
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Skeleton variant="circular" width={36} height={36} />
                                                    <Box sx={{ flex: 1 }}>
                                                        <Skeleton variant="text" width="40%" />
                                                        <Skeleton variant="text" width="90%" />
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (comments?.length ?? 0) === 0 ? (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            border: '1px dashed',
                                            borderColor: 'divider',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography fontWeight={900}>No comments yet</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            Be the first to share your thoughts.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {comments!.map((c) => (
                                            <Box
                                                key={c.id}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'divider'
                                                }}
                                            >
                                                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                    <Avatar sx={{ width: 36, height: 36 }}>
                                                        {initials(c.userFullName)}
                                                    </Avatar>

                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Stack
                                                            direction="row"
                                                            alignItems="center"
                                                            justifyContent="space-between"
                                                            spacing={2}
                                                        >
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Typography fontWeight={900} noWrap>
                                                                    {c.userFullName}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    • {timeAgo(c.createdAt)}
                                                                </Typography>
                                                            </Stack>
                                                        </Stack>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mt: 0.75,
                                                                whiteSpace: 'pre-wrap',
                                                                wordBreak: 'break-word'
                                                            }}
                                                        >
                                                            {c.content}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                            </Stack>
                        </Paper>
                    </>
                )}
            </Stack>
        </Container>
    );
}