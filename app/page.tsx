'use client';

import { Box, Container, Stack } from '@mui/material';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/features/categories/components/CategoriesSection';
import { ArticlesSection } from '@/features/articles/components/ArticlesSection';

export default function Home() {
  return (
    <Box className="min-h-screen">
      <HeroSection />

      <Container maxWidth="lg" className="py-8">
        <Stack spacing={6}>
          <CategoriesSection />
          <ArticlesSection />
        </Stack>
      </Container>
    </Box>
  );
}
