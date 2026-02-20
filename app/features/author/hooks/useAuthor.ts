import api from '@/shared/api/api';
import { useApi } from '@mbs-dev/api-request';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Article, PageResponse } from '@/types/article';

export type AuthorArticlesQuery = {
    q?: string;
    sort?: string;
    size?: number;
};

const emptyPage = <T,>(size: number): PageResponse<T> => ({
    content: [],
    empty: true,
    first: true,
    last: true,
    number: 0,
    numberOfElements: 0,
    size,
    totalElements: 0,
    totalPages: 0,
});

export function useAuthorArticles(query: AuthorArticlesQuery, authorId?: number) {
    const { apiCall } = useApi(api);
    const size = query.size ?? 200;
    const sort = query.sort ?? 'createdAt,desc';

    return useQuery<PageResponse<Article>, Error>({
        queryKey: ['author-articles', { ...query, authorId }],
        enabled: !!authorId,
        queryFn: async () => {
            const res = await apiCall({
                url: '/articles',
                method: 'GET',
                requiresAuth: true,
                params: {
                    page: 0,
                    size,
                    sort,
                    name: query.q || undefined,
                },
            });

            const data = (res?.data as PageResponse<Article> | undefined) ?? emptyPage<Article>(size);

            const filtered = (data.content || []).filter((a) => a.authorId === authorId);

            return {
                ...data,
                content: filtered,
                numberOfElements: filtered.length,
                totalElements: filtered.length,
                totalPages: 1,
                first: true,
                last: true,
                empty: filtered.length === 0,
                number: 0,
                size,
            };
        },
        staleTime: 20 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
}

export function useArticleById(id?: number) {
    const { apiCall } = useApi(api);

    return useQuery<Article | null, Error>({
        queryKey: ['author-article-by-id', id],
        enabled: typeof id === 'number' && id > 0,
        queryFn: async () => {
            const res = await apiCall({
                url: `/articles/${id}`,
                method: 'GET',
                requiresAuth: true,
            });
            return (res?.data as Article | null) ?? null;
        },
        staleTime: 20 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

function buildArticleFormData(values: {
    title: string;
    excerpt?: string;
    content: string;
    keywords?: string;
    status: string;
    categoryId?: number;
    thumbnail?: File | null;
}) {
    const fd = new FormData();
    fd.append('title', values.title);
    if (values.excerpt) fd.append('excerpt', values.excerpt);
    fd.append('content', values.content);
    if (values.keywords) fd.append('keywords', values.keywords);
    fd.append('status', values.status);
    if (values.categoryId) fd.append('categoryId', String(values.categoryId));
    if (values.thumbnail) fd.append('thumbnail', values.thumbnail);
    return fd;
}

export function useCreateArticle() {
    const { apiCall } = useApi(api);
    const qc = useQueryClient();

    return useMutation({
        mutationKey: ['author-article-create'],
        mutationFn: async (values: Parameters<typeof buildArticleFormData>[0]) => {
            const formData = buildArticleFormData(values);
            const res = await apiCall({
                url: '/articles',
                method: 'POST',
                data: formData,
                requiresAuth: true,
            });
            return res?.data as Article | undefined;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['author-articles'] });
            await qc.invalidateQueries({ queryKey: ['articles'] });
        },
    });
}

export function useUpdateArticle(articleId?: number) {
    const { apiCall } = useApi(api);
    const qc = useQueryClient();

    return useMutation({
        mutationKey: ['author-article-update', articleId],
        mutationFn: async (values: Parameters<typeof buildArticleFormData>[0]) => {
            if (!articleId) throw new Error('articleId is missing');
            const formData = buildArticleFormData(values);
            const res = await apiCall({
                url: `/articles/${articleId}`,
                method: 'PUT',
                data: formData,
                requiresAuth: true,
            });
            return res?.data as Article | undefined;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['author-articles'] });
            await qc.invalidateQueries({ queryKey: ['author-article-by-id', articleId] });
            await qc.invalidateQueries({ queryKey: ['articles'] });
        },
    });
}

export function useDeleteArticle() {
    const { apiCall } = useApi(api);
    const qc = useQueryClient();

    return useMutation({
        mutationKey: ['author-article-delete'],
        mutationFn: async (id: number) => {
            await apiCall({
                url: `/articles/${id}`,
                method: 'DELETE',
                requiresAuth: true,
            });
            return true;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['author-articles'] });
            await qc.invalidateQueries({ queryKey: ['articles'] });
        },
    });
}