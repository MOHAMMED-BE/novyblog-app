'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Link as MuiLink,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { useAuthContext } from '@/contexts/AuthContext';
import { LoginPayload } from '@/types/auth';
import { loginSchema } from 'validation/authSchema';
import Image from 'next/image';

export const InitLogin: LoginPayload = {
    email: 'novy.dev@novi.io',
    password: 'azerty',
};

export default function Login() {
    const router = useRouter();
    const { login } = useAuthContext();
    const [formBanner, setFormBanner] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginPayload>({
        resolver: zodResolver(loginSchema),
        defaultValues: InitLogin,
        mode: 'onBlur',
    });

    const onSubmit = async (values: LoginPayload) => {
        setFormBanner(null);

        try {
            await login(values.email, values.password);
            router.push('/');
        } catch (err: any) {

            const status = err?.response?.status ?? err?.response?.data?.status;

            const backendTitle: string | undefined =
                err?.response?.data?.title || err?.title || err?.response?.error;

            const backendMessage: string | undefined =
                err?.response?.data?.message || err?.response?.data?.detail || err?.message;

            if (status === 423 && backendMessage) {
                setFormBanner(backendMessage);
                return;
            }

            if (status === 401) {
                if (backendTitle === 'Invalid credentials') {
                    setFormBanner('Invalid email or password.');
                    return;
                }

                setFormBanner('Unauthorized access.');
                return;
            }

            setFormBanner('Something went wrong. Please try again.');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '80svh',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #f8fafc 100%)',
                px: 2,
                py: 6,
            }}
        >
            <Container maxWidth="sm">
                <Stack spacing={3} alignItems="center">
                    {/* Header */}
                    <Stack spacing={1} alignItems="center" textAlign="center">
                        <Image
                            src="/media/logo.png"
                            alt="Logo"
                            width={110}
                            height={60}
                            priority
                            style={{ objectFit: "contain" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Enter your email and password to continue.
                        </Typography>
                    </Stack>

                    {/* Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            p: { xs: 2.5, sm: 3.5 },
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'rgba(255,255,255,0.75)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        {formBanner && (
                            <Alert
                                severity="error"
                                variant="outlined"
                                sx={{
                                    mb: 2.5,
                                    borderRadius: 3,
                                    '& .MuiAlert-message': { width: '100%' },
                                }}
                            >
                                {formBanner}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                            <Stack spacing={2}>
                                <TextField
                                    label="Email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    {...register('email')}
                                />

                                <Stack spacing={0.75}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.secondary">
                                            Password
                                        </Typography>

                                        <MuiLink
                                            component={Link}
                                            href="/forgot-password"
                                            underline="hover"
                                            color="text.secondary"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            Forgot password?
                                        </MuiLink>
                                    </Stack>

                                    <TextField
                                        type="password"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        fullWidth
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                        {...register('password')}
                                    />
                                </Stack>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    fullWidth
                                    size="large"
                                    variant="contained"
                                    sx={{
                                        borderRadius: 3,
                                        py: 1.25,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        bgcolor: 'grey.900',
                                        '&:hover': { bgcolor: 'grey.800' },
                                    }}
                                >
                                    {isSubmitting ? (
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <CircularProgress size={18} sx={{ color: 'common.white' }} />
                                            <span>Submitting...</span>
                                        </Stack>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>

                                <Divider sx={{ my: 0.5 }} />

                                <Typography variant="body2" color="text.secondary" textAlign="center">
                                    Don’t have an account?{' '}
                                    <MuiLink
                                        component={Link}
                                        href="/auth/register"
                                        underline="hover"
                                        color="text.primary"
                                        sx={{ fontWeight: 800 }}
                                    >
                                        Sign up
                                    </MuiLink>
                                </Typography>
                            </Stack>
                        </Box>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
}
