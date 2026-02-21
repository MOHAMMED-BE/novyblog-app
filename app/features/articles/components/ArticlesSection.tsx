'use client';

import * as React from 'react';
import { Alert, Box, Button, Skeleton, Stack } from '@mui/material';
import type { EmblaOptionsType } from 'embla-carousel';
import { useArticles } from '@/features/articles/hooks/useArticles';
import { ArticleCard } from '@/features/articles/components/ArticleCard';
import type { Article } from '@/types/article';
import { SectionHeader } from '@/components/home/SectionHeader';
import { LinkBehavior } from '@/components/home/HomeLinkBehavior';
import { EmblaCarousel } from '@/shared/ui/EmblaCarousel';

const articlesEmblaOptions: EmblaOptionsType = { loop: false, align: 'start' };

export function ArticlesSection() {
    const { data, isLoading, isError, error } = useArticles(10, {});
    const articles: Article[] = data?.pages?.[0]?.content ?? [];

    const slides: React.ReactNode[] = React.useMemo(() => {
        if (isLoading) {
            return Array.from({ length: 6 }).map((_, i) => (
                <Box
                    key={i}
                    className="flex-[0_0_90%] sm:flex-[0_0_48%] md:flex-[0_0_32%] lg:flex-[0_0_28%] min-w-0"
                >
                    <Skeleton variant="rounded" height={320} className="rounded-3xl" />
                </Box>
            ));
        }

        return articles.slice(0, 10).map((a) => (
            <Box
                key={a.id}
                className="flex-[0_0_90%] sm:flex-[0_0_48%] md:flex-[0_0_32%] lg:flex-[0_0_28%] min-w-0"
            >
                <Box className="h-full transition-transform hover:-translate-y-0.5">
                    <ArticleCard article={a} />
                </Box>
            </Box>
        ));
    }, [articles, isLoading]);

    return (
        <Stack spacing={2}>
            <SectionHeader
                title="Latest articles"
                subtitle="Fresh content, ready to read."
                action={
                    <Button component={LinkBehavior} href="/articles" variant="contained" size="small">
                        Browse all
                    </Button>
                }
            />

            {isError ? (
                <Alert severity="error">{error?.message || 'Failed to load articles.'}</Alert>
            ) : (
                <EmblaCarousel options={articlesEmblaOptions} showArrows showDots={false}>
                    {slides}
                </EmblaCarousel>
            )}
        </Stack>
    );
}
