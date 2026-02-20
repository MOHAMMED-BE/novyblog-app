import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { triggerLogout } from '@/shared/auth/authBus';

interface ErrorResponse {
    message?: string; detail?: string; error?: string;
    errors?: Record<string, string | string[]>;
}

const extractErrorMessage = (err: unknown): string => {
    const fallback = 'Something went wrong';
    const ax = err as AxiosError<ErrorResponse>;
    const d = ax?.response?.data;
    const c = [d?.message, d?.detail, d?.error, ax?.message].filter(Boolean) as string[];
    if (c.length) return c[0];
    if (d?.errors && typeof d.errors === 'object') {
        const v = Object.values(d.errors)[0];
        if (Array.isArray(v) && v.length) return String(v[0]);
        if (typeof v === 'string') return v;
    }
    return fallback;
};

export const createApi = (baseURL: string, tokenSource?: string | (() => Promise<string | undefined>)): AxiosInstance => {
    const api = axios.create({ baseURL });

    api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
        if (config.requiresAuth && config.headers) {
            const token = typeof tokenSource === 'function' ? await tokenSource() : tokenSource;
            if (token) config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    api.interceptors.response.use(
        (r: AxiosResponse) => r,
        async (error: AxiosError<ErrorResponse>) => {
            const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean; requiresAuth?: boolean }) | undefined;

            const isProtected = !!original?.requiresAuth;

            if (error.response?.status === 401 && isProtected) {
                triggerLogout('token_expired');
            }

            const message = extractErrorMessage(error);
            return Promise.reject({ ...error, message });
        }
    );

    return api;
};
