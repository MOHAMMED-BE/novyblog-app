'use client';

import * as React from 'react';
import { Alert, Box, Button, Skeleton, Stack } from '@mui/material';
import type { EmblaOptionsType } from 'embla-carousel';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { CategoryTile, type Category } from './CategoryTile';
import { SectionHeader } from '@/components/home/SectionHeader';
import { LinkBehavior } from '@/components/home/HomeLinkBehavior';
import { EmblaCarousel } from 'shared/ui/EmblaCarousel';

const categoriesEmblaOptions: EmblaOptionsType = {
    loop: true,
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
};

export function CategoriesSection() {
    const { data, isLoading, isError, error } = useCategories(0, 8);

    const categories: Category[] = Array.isArray(data) ? data : [];

    const slides: React.ReactNode[] = React.useMemo(() => {
        if (isLoading) {
            return Array.from({ length: 8 }).map((_, i) => (
                <Box key={i} className="flex-[0_0_auto] w-44 sm:w-52">
                    <Skeleton variant="rounded" height={78} className="rounded-2xl" />
                </Box>
            ));
        }
        return categories.map((c) => <CategoryTile key={c.id} category={c} />);
    }, [categories, isLoading]);

    return (
        <Stack spacing={2}>
            <SectionHeader
                title="Latest categories"
                subtitle="Quickly jump into a topic you care about."
                action={
                    <Button component={LinkBehavior} href="/articles" variant="text">
                        View all
                    </Button>
                }
            />

            {isError ? (
                <Alert severity="error">{error?.message || 'Failed to load categories.'}</Alert>
            ) : (
                <EmblaCarousel
                    options={categoriesEmblaOptions}
                    showArrows={false}
                    showDots={false}
                    autoplay
                    autoplayDelay={2500}
                >
                    {slides}
                </EmblaCarousel>
            )}
        </Stack>
    );
}
