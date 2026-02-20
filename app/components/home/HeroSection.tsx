'use client';

import * as React from 'react';
import { Box, Button, Container, Skeleton, Stack, Typography } from '@mui/material';
import type { EmblaOptionsType } from 'embla-carousel';
import { LinkBehavior } from '@/components/home/HomeLinkBehavior';
import { EmblaCarousel } from '@/shared/ui/EmblaCarousel';
import { useArticles } from '@/features/articles/hooks/useArticles';
import type { Article } from 'types/article';
import { env } from '@/configs/env';

const heroEmblaOptions: EmblaOptionsType = { loop: true, align: 'start' };

export function HeroSection() {
    const { data, isLoading, isError } = useArticles(3);

    const articles: Article[] = React.useMemo(() => {
        const pages = data?.pages ?? [];
        return pages.flatMap((p) => p.content).slice(0, 3);
    }, [data]);

    if (isLoading) {
        return (
            <Container maxWidth="lg" className="mt-6">
                <Box className="overflow-hidden rounded-2xl border border-black/10 shadow-sm dark:border-white/10">
                    <Skeleton variant="rectangular" className="h-105 sm:h-130 w-full" />
                </Box>
            </Container>
        );
    }

    if (isError || articles.length === 0) return null;

    const heroSlides = articles.map((a) => (
        <Box key={a.id} className="relative flex-[0_0_100%] min-w-0">
            <Box
                component="img"
                src={`${env.uploadUrl}${a.thumbnailUrl}`}
                alt={a.title}
                loading="lazy"
                className="h-105 sm:h-130 w-full object-cover"
            />

            {/* overlay */}
            <Box className="absolute inset-0 bg-linear-to-r from-black/70 via-black/35 to-transparent" />

            {/* content */}
            <Box className="absolute inset-0 flex items-center">
                <Container maxWidth="lg">
                    <Stack spacing={2.2} className="max-w-xl text-white">
                        <Typography variant="h4" fontWeight={950} className="leading-tight">
                            {a.title}
                        </Typography>

                        <Typography variant="body1" className="text-white/85 line-clamp-3">
                            {a.excerpt}
                        </Typography>

                        <Box>
                            <Button
                                component={LinkBehavior}
                                href={`/articles/${a.slug}`}
                                variant="contained"
                                size="large"
                                className="rounded-xl"
                            >
                                Read article
                            </Button>
                        </Box>
                    </Stack>
                </Container>
            </Box>
        </Box>
    ));

    return (
        <Container maxWidth="lg" className="mt-6">
            <Box className="overflow-hidden rounded-2xl border border-black/10 shadow-sm dark:border-white/10">
                <EmblaCarousel options={heroEmblaOptions} showArrows showDots={false} autoplay autoplayDelay={6000}>
                    {heroSlides}
                </EmblaCarousel>
            </Box>
        </Container>
    );
}