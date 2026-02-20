'use client';

import NextLink from 'next/link';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    CardActions,
    Box,
    CardActionArea,
} from '@mui/material';
import { Article } from 'types/article';
import { env } from '@/configs/env';

function stripHtml(html: unknown) {
    const s = typeof html === 'string' ? html : html == null ? '' : String(html);
    return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function takeWords(text: unknown, count: number) {
    const clean = stripHtml(text);
    const words = clean.split(/\s+/).filter(Boolean);
    return words.slice(0, count).join(' ');
}

export function ArticleCard({ article }: { article: Article }) {
    const excerpt = typeof article.excerpt === 'string' ? article.excerpt : '';
    const content = typeof article.content === 'string' ? article.content : '';

    const previewSource = excerpt.trim() ? excerpt : content;
    const preview = takeWords(previewSource, 12);

    const imageUrl = article.thumbnailUrl;
    const href = `/articles/${article.slug}`;

    return (
        <Card
            elevation={0}
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                maxWidth: 340,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                '&:hover': {
                    borderColor: 'text.secondary',
                },
                '&:focus-within': {
                    borderColor: 'primary.main',
                },
            }}
        >
            {/* Make the WHOLE card clickable */}
            <CardActionArea
                component={NextLink as any}
                href={href}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    height: '100%',
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    {/* Fixed image height */}
                    <CardMedia
                        component="img"
                        image={`${env.uploadUrl}${imageUrl}`}
                        alt={article.title}
                        sx={{
                            height: { xs: 200, sm: 220, md: 210 },
                            width: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </Box>

                <CardContent sx={{ flex: 1, width: '100%' }}>
                    <Typography
                        variant="h6"
                        fontWeight={900}
                        gutterBottom
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {article.title}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {preview}
                        {preview ? '…' : ''}
                    </Typography>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, pt: 0, width: '100%' }}>
                    {/* CTA button (card already clickable) */}
                    <Button
                        variant="contained"
                        size="small"
                        sx={{
                            borderRadius: 999,
                            textTransform: 'none',
                            fontWeight: 800,
                            px: 2,
                            bgcolor: 'secondary.main',
                            '&:hover': {
                                bgcolor: 'secondary.dark',
                            },
                        }}
                    >
                        Read more
                    </Button>
                </CardActions>
            </CardActionArea>
        </Card>
    );
}
