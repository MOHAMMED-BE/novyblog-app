'use client';

import * as React from 'react';
import { Container, Stack, Typography, Grid, Skeleton, Alert, Box, Divider } from '@mui/material';

import { ArticleCard } from '@/features/articles/components/ArticleCard';
import { FilterPanel } from '@/features/articles/components/FilterPanel';
import { useArticles } from '@/features/articles/hooks/useArticles';
import { PaginationBar } from '@/shared/ui/PaginationBar';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { ArticleFilters } from '@/types/article';
import { useArticlesNavStore } from '@/features/articles/stores/articlesNav.store';

const PAGE_SIZE = 5;

export default function ArticlesPage() {
    const [draftFilters, setDraftFilters] = React.useState<ArticleFilters>({});
    const [appliedFilters, setAppliedFilters] = React.useState<ArticleFilters>({});
    const [selectedPage, setSelectedPage] = React.useState<number>(1);
    const debouncedDraftFilters = useDebounce(draftFilters, 800);

    React.useEffect(() => {
        const pending = useArticlesNavStore.getState().consumePending();
        if (pending?.categoryName) {
            setDraftFilters((prev) => ({ ...prev, categoryName: pending.categoryName }));
            setAppliedFilters((prev) => ({ ...prev, categoryName: pending.categoryName }));
        }
    }, []);

    React.useEffect(() => {
        setAppliedFilters(debouncedDraftFilters);
    }, [debouncedDraftFilters]);

    const finalFilters = React.useMemo<ArticleFilters>(() => {
        return {
            ...appliedFilters,
            status: 'PUBLISHED',
        };
    }, [appliedFilters]);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useArticles(PAGE_SIZE, finalFilters);

    const pages = data?.pages ?? [];
    const pagesLoaded = pages.length;

    const lastMeta = pages[pages.length - 1];
    const totalPages = lastMeta?.totalPages ?? 0;
    const totalElements = lastMeta?.totalElements ?? 0;

    const items = React.useMemo(() => {
        return pages.flatMap((p) => p.content ?? []);
    }, [pages]);

    const anchorsRef = React.useRef<Array<HTMLDivElement | null>>([]);

    React.useEffect(() => {
        setSelectedPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [JSON.stringify(appliedFilters)]);

    const handleApply = () => {
        setAppliedFilters(draftFilters);
    };

    const handleReset = () => {
        setDraftFilters({});
        setAppliedFilters({});
    };

    const handleSelectPage = (page: number) => {
        setSelectedPage(page);
        const el = anchorsRef.current[page - 1];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleLoadMore = async () => {
        const before = pagesLoaded;
        await fetchNextPage();
        const nextPage = before + 1;
        setSelectedPage(nextPage);
        setTimeout(() => {
            const el = anchorsRef.current[nextPage - 1];
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={3}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" fontWeight={900}>
                        Articles
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Browse articles with filters and load more.
                    </Typography>
                </Stack>

                {/*Left filters / Right content */}
                <Grid container spacing={3} alignItems="flex-start">
                    <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                        <FilterPanel
                            value={draftFilters}
                            onChange={setDraftFilters}
                            onApply={handleApply}
                            onReset={handleReset}
                            loading={isFetching}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                        <Stack spacing={3}>
                            <Divider />

                            {isError && <Alert severity="error">{error?.message || 'Failed to load articles.'}</Alert>}

                            {isLoading ? (
                                <Grid container spacing={2}>
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}>
                                            <Skeleton variant="rounded" height={320} />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <>
                                    {/* Anchors per loaded page (for pagination scroll) */}
                                    <Box sx={{ display: 'none' }}>
                                        {pages.map((_, idx) => (
                                            <div
                                                key={idx}
                                                ref={(el) => {
                                                    anchorsRef.current[idx] = el;
                                                }}
                                            />
                                        ))}
                                    </Box>

                                    <Stack spacing={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            Loaded: {items.length} article(s)
                                            {isFetching && !isFetchingNextPage ? ' • Refreshing…' : ''}
                                        </Typography>

                                        <Grid container spacing={2}>
                                            {items.map((a, index) => (
                                                <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}>
                                                    <ArticleCard article={a} />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Stack>

                                    <PaginationBar
                                        showPagination={false}
                                        pagesLoaded={pagesLoaded}
                                        totalPages={totalPages}
                                        totalElements={totalElements}
                                        hasNextPage={!!hasNextPage}
                                        isFetchingNextPage={isFetchingNextPage}
                                        selectedPage={Math.min(selectedPage, Math.max(pagesLoaded, 1))}
                                        onSelectPage={handleSelectPage}
                                        onLoadMore={handleLoadMore}
                                    />
                                </>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>
        </Container>
    );
}