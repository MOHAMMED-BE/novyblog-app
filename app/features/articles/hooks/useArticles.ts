import api from '@/shared/api/api';
import { useApi } from '@mbs-dev/api-request';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Article, ArticleFilters, PageResponse } from '@/types/article';

const emptyPage = <T,>(size: number): PageResponse<T> => ({
    content: [],
    empty: true,
    first: true,
    last: true,
    number: 0,
    numberOfElements: 0,
    size,
    totalElements: 0,
    totalPages: 0
});

export const useArticles = (size: number = 10, filters: ArticleFilters = {}) => {
    const { apiCall } = useApi(api);

    return useInfiniteQuery<PageResponse<Article>, Error>({
        queryKey: ['articles', size, filters],
        initialPageParam: 0,

        queryFn: async ({ pageParam }) => {
            const res = await apiCall({
                url: '/articles',
                method: 'GET',
                requiresAuth: false,
                params: {
                    page: pageParam,
                    size,
                    sort: 'createdAt,desc',
                    ...filters
                }
            });

            const data = res?.data as PageResponse<Article> | undefined;
            return data ?? emptyPage<Article>(size);
        },

        getNextPageParam: (lastPage) => {
            if (!lastPage) return undefined;
            if (lastPage.last) return undefined;
            return lastPage.number + 1;
        },

        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
};

export const useArticleBySlug = (slug?: string) => {
    const { apiCall } = useApi(api);

    return useQuery<Article | null, Error>({
        queryKey: ['article-by-slug', slug],
        enabled: !!slug,

        queryFn: async () => {
            const res = await apiCall({
                url: `/articles/slug/${slug}`,
                method: 'GET',
                requiresAuth: false
            });

            return (res?.data as Article | null) ?? null;
        },

        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
};

// ---------------------------
// ✅ Comments (NEW)
// ---------------------------

export type CommentStatus = 'VISIBLE' | 'HIDDEN' | 'DELETED';

export type ArticleComment = {
    id: number;
    articleId: number;
    userId: number;
    userFullName: string;
    content: string;
    status: CommentStatus;
    createdAt: string;
    updatedAt: string;
};

export type CreateCommentPayload = {
    content: string;
};

export const useArticleComments = (articleId?: number) => {
    const { apiCall } = useApi(api);

    return useQuery<ArticleComment[], Error>({
        queryKey: ['article-comments', articleId],
        enabled: typeof articleId === 'number' && articleId > 0,
        queryFn: async () => {
            const res = await apiCall({
                url: `/articles/${articleId}/comments`,
                method: 'GET',
                requiresAuth: false
            });

            return (res?.data as ArticleComment[] | undefined) ?? [];
        },
        staleTime: 20 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
};

export const useCreateArticleComment = (articleId?: number) => {
    const { apiCall } = useApi(api);
    const qc = useQueryClient();

    return useMutation({
        mutationKey: ['article-comments-create', articleId],
        mutationFn: async (payload: CreateCommentPayload) => {
            if (!articleId) throw new Error('articleId is missing');
            const res = await apiCall({
                url: `/articles/${articleId}/comments`,
                method: 'POST',
                data: payload,
                requiresAuth: true
            });
            return res?.data as ArticleComment | undefined;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['article-comments', articleId] });
        }
    });
};