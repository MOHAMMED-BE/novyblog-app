'use client';

import Link from 'next/link';
import { PropsWithChildren, useMemo } from 'react';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

const DRAWER_WIDTH = 280;

function initials(name?: string) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (first + last).toUpperCase() || '?';
}

export default function AuthorShell({ children }: PropsWithChildren) {
    const pathname = usePathname();
    const { user, logout } = useAuthContext();

    const nav = useMemo(
        () => [
            { label: 'My Articles', href: '/author/articles' },
            { label: 'Create Article', href: '/author/articles/new' },
        ],
        []
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                color="default"
                elevation={0}
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    zIndex: (t) => t.zIndex.drawer + 1,
                }}
            >
                <Toolbar sx={{ gap: 2 }}>
                    <Typography fontWeight={950}>Author Dashboard</Typography>

                    <Box sx={{ flex: 1 }} />

                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {user?.fullName || user?.email}
                        </Typography>
                        <Avatar sx={{ width: 32, height: 32 }}>{initials(user?.fullName)}</Avatar>

                        <Button variant="outlined" size="small" onClick={logout}>
                            Logout
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                        <Box>
                            <Typography variant="overline" color="text.secondary">
                                Account
                            </Typography>
                            <Typography fontWeight={900} sx={{ mt: 0.25 }}>
                                {user?.fullName || 'AUTHOR'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </Box>

                        <Divider />

                        <List sx={{ p: 0 }}>
                            {nav.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <ListItemButton
                                        key={item.href}
                                        component={Link}
                                        href={item.href}
                                        selected={active}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{ fontWeight: active ? 950 : 800 }}
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>

                        <Divider />

                        <Button component={Link} href="/articles" variant="text" sx={{ justifyContent: 'flex-start', fontWeight: 900 }}>
                            ← Back to public site
                        </Button>
                    </Stack>
                </Box>
            </Drawer>

            <Box sx={{ flex: 1, bgcolor: 'background.default' }}>
                <Toolbar />
                <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
            </Box>
        </Box>
    );
}