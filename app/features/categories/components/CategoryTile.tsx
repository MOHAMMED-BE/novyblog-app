'use client';

import * as React from 'react';
import { Box, ButtonBase, Paper, Typography } from '@mui/material';
import { LinkBehavior } from '@/components/home/HomeLinkBehavior';
import { useArticlesNavStore } from '@/features/articles/stores/articlesNav.store';

export type Category = {
    id: number;
    name: string;
    slug: string;
};

export function CategoryTile({ category }: { category: Category }) {
    const setPending = useArticlesNavStore((s) => s.setPending);

    const handleClick = React.useCallback(() => {
        setPending({ categoryName: category.name });
    }, [category.name, setPending]);

    return (
        <Box className="flex-[0_0_auto] w-44 sm:w-52">
            <Paper
                variant="outlined"
                className="rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5"
            >
                <ButtonBase
                    component={LinkBehavior}
                    href="/articles"
                    onClick={handleClick}
                    className="w-full text-left"
                >
                    <Box className="w-full px-4 py-4">
                        <Typography variant="subtitle1" fontWeight={800} noWrap>
                            {category.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            #{category.slug}
                        </Typography>
                    </Box>
                </ButtonBase>
            </Paper>
        </Box>
    );
}