"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    Divider,
    Menu,
    MenuItem,
    CircularProgress,
    Tooltip,
    Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useCategories } from "@/features/categories/hooks/useCategories";
import { useAuthContext } from "@/contexts/AuthContext";
import { useArticlesNavStore } from "@/features/articles/stores/articlesNav.store";

type NavItem = {
    label: string;
    href: string;
};

const PRIMARY_NAV: readonly NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Articles", href: "/articles" },
] as const;

const AUTH_NAV: readonly NavItem[] = [
    { label: "Login", href: "/auth/login" },
    { label: "Register", href: "/auth/register" },
] as const;

function isActivePath(pathname: string, href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header(): React.JSX.Element {
    const pathname = usePathname();
    const router = useRouter();

    const { user, logout, isAuthenticated } = useAuthContext();
    const setPending = useArticlesNavStore((s) => s.setPending);

    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [catAnchorEl, setCatAnchorEl] = React.useState<HTMLElement | null>(null);
    const [userAnchorEl, setUserAnchorEl] = React.useState<HTMLElement | null>(null);

    const catMenuOpen = Boolean(catAnchorEl);
    const userMenuOpen = Boolean(userAnchorEl);

    const { data: categories = [], isLoading, isError, refetch } = useCategories(0, 20);

    const toggleMobile = () => setMobileOpen((v) => !v);
    const closeMobile = () => setMobileOpen(false);

    const openCatMenu = (e: React.MouseEvent<HTMLElement>) => setCatAnchorEl(e.currentTarget);
    const closeCatMenu = () => setCatAnchorEl(null);

    const openUserMenu = (e: React.MouseEvent<HTMLElement>) => setUserAnchorEl(e.currentTarget);
    const closeUserMenu = () => setUserAnchorEl(null);

    const handleLogout = () => {
        closeUserMenu();
        logout();
        router.push("/");
    };

    const goToArticlesWithCategory = React.useCallback(
        (categoryName?: string) => {
            closeCatMenu();
            setPending(categoryName ? { categoryName } : {});
            router.push("/articles");
        },
        [router, setPending]
    );

    return (
        <>
            <AppBar position="sticky" elevation={3} sx={{ bgcolor: "#fff", color: "text.primary" }}>
                <Toolbar sx={{ minHeight: 64, gap: 1 }}>
                    {/* Mobile menu */}
                    <IconButton
                        edge="start"
                        onClick={toggleMobile}
                        sx={{ display: { xs: "inline-flex", md: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Logo */}
                    <Link href="/" aria-label="Home">
                        <Image
                            src="/media/logo.png"
                            alt="Logo"
                            width={110}
                            height={60}
                            priority
                            style={{ objectFit: "contain" }}
                        />
                    </Link>

                    {/* Desktop nav */}
                    <Box
                        component="nav"
                        sx={{
                            flex: 1,
                            display: { xs: "none", md: "flex" },
                            justifyContent: "center",
                            gap: 1,
                        }}
                    >
                        {PRIMARY_NAV.map((item) => {
                            const active = isActivePath(pathname, item.href);
                            return (
                                <Button
                                    key={item.href}
                                    component={Link}
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: active ? 700 : 500,
                                    }}
                                >
                                    {item.label}
                                </Button>
                            );
                        })}

                        {/* Categories */}
                        <Tooltip title="Browse categories">
                            <Button
                                onClick={openCatMenu}
                                endIcon={<ExpandMoreIcon />}
                                sx={{ textTransform: "none", fontWeight: 500 }}
                            >
                                Categories
                            </Button>
                        </Tooltip>

                        <Menu anchorEl={catAnchorEl} open={catMenuOpen} onClose={closeCatMenu}>
                            <MenuItem onClick={() => goToArticlesWithCategory(undefined)}>
                                All categories
                            </MenuItem>
                            <Divider />
                            {isLoading ? (
                                <Box sx={{ px: 2, py: 1.5, display: "flex", gap: 1 }}>
                                    <CircularProgress size={18} />
                                    <Typography variant="body2">Loading…</Typography>
                                </Box>
                            ) : isError ? (
                                <MenuItem onClick={() => refetch()}>Retry</MenuItem>
                            ) : (
                                categories.map((c) => (
                                    <MenuItem
                                        key={c.id}
                                        onClick={() => goToArticlesWithCategory(c.name)}
                                    >
                                        {c.name}
                                    </MenuItem>
                                ))
                            )}
                        </Menu>
                    </Box>

                    {/* Auth area (desktop) */}
                    <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
                        {!isAuthenticated ? (
                            <>
                                <Button component={Link} href="/auth/login">
                                    Login
                                </Button>
                                <Button component={Link} href="/auth/register" variant="contained">
                                    Register
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={openUserMenu}
                                    endIcon={<ExpandMoreIcon />}
                                    sx={{ textTransform: "none", fontWeight: 600 }}
                                >
                                    <Avatar sx={{ width: 28, height: 28, mr: 1 }}>
                                        {user?.fullName?.[0]}
                                    </Avatar>
                                    {user?.fullName}
                                </Button>

                                <Menu
                                    anchorEl={userAnchorEl}
                                    open={userMenuOpen}
                                    onClose={closeUserMenu}
                                >
                                    <MenuItem component={Link} href="/author" onClick={closeUserMenu}>
                                        Profile
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile drawer */}
            <Drawer anchor="left" open={mobileOpen} onClose={closeMobile}>
                <Box sx={{ width: 300 }}>
                    <List>
                        {PRIMARY_NAV.map((item) => (
                            <ListItemButton
                                key={item.href}
                                component={Link}
                                href={item.href}
                                onClick={closeMobile}
                            >
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        ))}
                    </List>

                    <Divider />

                    <List>
                        {!isAuthenticated ? (
                            AUTH_NAV.map((item) => (
                                <ListItemButton
                                    key={item.href}
                                    component={Link}
                                    href={item.href}
                                    onClick={closeMobile}
                                >
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            ))
                        ) : (
                            <>
                                <ListItemButton component={Link} href="/profile" onClick={closeMobile}>
                                    <ListItemText primary={user?.fullName} />
                                </ListItemButton>
                                <ListItemButton
                                    onClick={() => {
                                        closeMobile();
                                        handleLogout();
                                    }}
                                >
                                    <ListItemText primary="Logout" />
                                </ListItemButton>
                            </>
                        )}
                    </List>
                </Box>
            </Drawer>
        </>
    );
}