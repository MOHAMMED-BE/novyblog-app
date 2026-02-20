import 'axios';

declare module 'axios' {
    export interface AxiosRequestConfig<D = any> {
        requiresAuth?: boolean;
        _retry?: boolean;
    }
}
