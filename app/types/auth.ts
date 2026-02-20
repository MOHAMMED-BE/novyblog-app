export type RegisterPayload = {
    fullName: string;
    email: string;
    password: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type UserRole = 'ADMIN' | 'AUTHOR' | 'USER';

export interface User {
    id: number;
    email: string;
    fullName: string;
    roles: UserRole[];
}
