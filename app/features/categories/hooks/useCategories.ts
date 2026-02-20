import api from '@/shared/api/api';
import { useApi } from '@mbs-dev/api-request';
import { useQuery } from '@tanstack/react-query';

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export const useCategories = (page: number = 0, size: number = 10) => {
    const { apiCall } = useApi(api);

    return useQuery<Category[], Error>({
        queryKey: ['categories', page, size],

        queryFn: async () => {
            const res = await apiCall({
                url: '/categories',
                method: 'GET',
                requiresAuth: false,
                params: {
                    page,
                    size,
                },
            });

            return (res?.data ?? []) as Category[];
        },

        refetchOnMount: 'always',
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
    });
};