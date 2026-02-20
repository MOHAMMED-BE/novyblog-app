export type ArticleStatus = 'DRAFT' | 'PUBLISHED';

export interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnailUrl: string;
    status: ArticleStatus;
    publishedAt: string;
    authorId: number;
    categoryId: number;
    keywords?: string;
    categoryName?: string;
}

export type ArticleFilters = {
    slug?: string;
    name?: string;
    keywords?: string;
    categoryName?: string;
    status?: ArticleStatus;
};

export type PageResponse<T> = {
    content: T[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;

    size: number;
    totalElements: number;
    totalPages: number;

    pageable?: {
        offset: number;
        pageNumber: number;
        pageSize: number;
        paged: boolean;
        unpaged: boolean;
        sort?: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
    };

    sort?: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
};