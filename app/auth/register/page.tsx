"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildPathMapFromZod } from "shared/utils/form/zodPathMap";
import { useRegister } from "@/features/auth/hooks/useAuth";
import { RegisterPayload } from "types/auth";
import { registerSchema } from "validation/authSchema";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Link as MuiLink,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useAuthContext } from "@/contexts/AuthContext";
import Image from "next/image";

export const InitRegister: RegisterPayload = {
    fullName: "MOHAMMED",
    email: "novy.dev@novi.io",
    password: "azerty",
};

export default function Register() {
    const router = useRouter();
    const [formBanner, setFormBanner] = useState<string | null>(null);
    const { user } = useAuthContext()
    const registerMutation = useRegister();

    useEffect(() => {
        if (user) router.push('/');
    }, [router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterPayload>({
        resolver: zodResolver(registerSchema),
        defaultValues: InitRegister,
        mode: "onBlur",
    });

    useMemo(
        () =>
            buildPathMapFromZod(registerSchema, {
                includeArrayIndexSamples: false,
                overrides: {},
            }),
        [registerSchema]
    );

    const onSubmit = (values: RegisterPayload) => {
        setFormBanner(null);

        registerMutation.mutate(values, {
            onSuccess: () => {
                router.push("/auth/login");
            },
            onError: (err: any) => {

                const status = err?.response?.status ?? err?.response?.data?.status;

                const backendMessage: string | undefined =
                    err?.response?.data?.message ||
                    err?.response?.data?.detail ||
                    err?.message;

                if (backendMessage) {
                    setFormBanner(backendMessage);
                    return;
                }

                if (status === 409) {
                    setFormBanner("Account already exists.");
                    return;
                }

                setFormBanner("Something went wrong. Please try again.");
            },
        });
    };

    const isSubmitting = registerMutation.isPending;

    return (
        <Box
            sx={{
                minHeight: "80svh",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 45%, #f8fafc 100%)",
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
                            Create your account to start using the app.
                        </Typography>
                    </Stack>

                    {/* Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: "100%",
                            p: { xs: 2.5, sm: 3.5 },
                            borderRadius: 4,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "rgba(255,255,255,0.75)",
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        {formBanner && (
                            <Alert
                                severity="error"
                                variant="outlined"
                                sx={{
                                    mb: 2.5,
                                    borderRadius: 3,
                                    "& .MuiAlert-message": { width: "100%" },
                                }}
                            >
                                {formBanner}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                            <Stack spacing={2}>
                                <TextField
                                    label="Full name"
                                    placeholder="Your name"
                                    autoComplete="name"
                                    fullWidth
                                    error={!!errors.fullName}
                                    helperText={errors.fullName?.message}
                                    {...register("fullName")}
                                />

                                <TextField
                                    label="Email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    {...register("email")}
                                />

                                <Stack spacing={0.75}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.secondary">
                                            Password
                                        </Typography>

                                        <MuiLink
                                            component={Link}
                                            href="/auth/login"
                                            underline="hover"
                                            color="text.secondary"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            Already have an account?
                                        </MuiLink>
                                    </Stack>

                                    <TextField
                                        type="password"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        fullWidth
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                        {...register("password")}
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
                                        textTransform: "none",
                                        fontWeight: 700,
                                        bgcolor: "grey.900",
                                        "&:hover": { bgcolor: "grey.800" },
                                    }}
                                >
                                    {isSubmitting ? (
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <CircularProgress size={18} sx={{ color: "common.white" }} />
                                            <span>Creating...</span>
                                        </Stack>
                                    ) : (
                                        "Create account"
                                    )}
                                </Button>

                                <Typography variant="body2" color="text.secondary" textAlign="center">
                                    By creating an account, you agree to our Terms and Privacy Policy.
                                </Typography>
                            </Stack>
                        </Box>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
}
