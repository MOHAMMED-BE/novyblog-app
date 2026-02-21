'use client';

import * as React from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    TextField,
    Button,
    Stack,
    Typography,
    Paper,
    Divider,
    Chip,
    InputAdornment,
    Box,
    MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import TitleIcon from '@mui/icons-material/Title';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';

import { ArticleFilters } from '@/types/article';
import { useCategories } from '@/features/categories/hooks/useCategories';

type Props = {
    value: ArticleFilters;
    onChange: (next: ArticleFilters) => void;
    onApply: () => void;
    onReset: () => void;
    loading?: boolean;
};

export function FilterPanel({ value, onChange, onApply, onReset, loading }: Props) {
    const { data: categories = [], isLoading: categoriesLoading } = useCategories(0, 100);

    const activeCount = React.useMemo(() => {
        const entries = Object.entries(value) as Array<[keyof ArticleFilters, unknown]>;
        return entries.reduce((acc, [, v]) => {
            if (v === undefined || v === null) return acc;
            if (typeof v === 'string' && v.trim() === '') return acc;
            return acc + 1;
        }, 0);
    }, [value]);

    const hasActive = activeCount > 0;

    const adornmentSx = {
        color: 'text.secondary',
        '& svg': { fontSize: 18 },
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                position: { md: 'sticky' },
                top: { md: 88 },
            }}
        >
            <Accordion defaultExpanded elevation={0} disableGutters>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                        px: 2,
                        py: 1.25,
                        minHeight: 56,
                        '& .MuiAccordionSummary-content': { my: 0, minWidth: 0 },
                        '& .MuiAccordionSummary-expandIconWrapper': { ml: 1 },
                        bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.03)'
                                : 'rgba(0,0,0,0.02)',
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
                        <Box
                            aria-hidden
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 2,
                                display: 'grid',
                                placeItems: 'center',
                                flex: '0 0 auto',
                                bgcolor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(255,255,255,0.06)'
                                        : 'rgba(0,0,0,0.06)',
                            }}
                        >
                            <TuneIcon sx={{ fontSize: 18 }} />
                        </Box>

                        <Stack spacing={0} sx={{ minWidth: 0, flex: 1 }}>
                            <Typography fontWeight={900} noWrap>
                                Filters
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                name, keywords, category
                            </Typography>
                        </Stack>

                        <Chip
                            size="small"
                            label={hasActive ? `${activeCount} active` : 'No filters'}
                            color={hasActive ? 'primary' : 'default'}
                            variant={hasActive ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 800, mr: 0.5 }}
                        />
                    </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 2 }}>
                    <Stack spacing={1.75}>
                        <Grid container spacing={1.75}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Name (title)"
                                    value={value.name ?? ''}
                                    onChange={(e) => onChange({ ...value, name: e.target.value })}
                                    placeholder="spring"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start" sx={adornmentSx}>
                                                <TitleIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Keywords"
                                    value={value.keywords ?? ''}
                                    onChange={(e) => onChange({ ...value, keywords: e.target.value })}
                                    placeholder="app,code"
                                    helperText="Comma-separated. Example: app,code"
                                    size="small"
                                    FormHelperTextProps={{ sx: { mt: 0.5 } }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start" sx={adornmentSx}>
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Category"
                                    value={value.categoryName ?? ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...value,
                                            categoryName: e.target.value || undefined,
                                        })
                                    }
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start" sx={adornmentSx}>
                                                <CategoryIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    disabled={categoriesLoading}
                                >
                                    <MenuItem value="">
                                        <em>All categories</em>
                                    </MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>

                        <Divider />

                        <Stack direction="row" spacing={1.25} justifyContent="flex-end">
                            <Button
                                variant="outlined"
                                onClick={onReset}
                                disabled={loading || !hasActive}
                                size="small"
                                sx={{ fontWeight: 900, px: 2.25 }}
                            >
                                Reset
                            </Button>
                        </Stack>
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
}