import type { User } from '~/types/models';
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl;

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export async function fetchUsers(page: number = 0, size: number = 20) {
    const auth = useAuth()
    const token = auth.token.value
    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'O usuário não está autenticado',
        })
    }

    try {
        const options = {
            method: 'GET' as const,
            credentials: 'include' as RequestCredentials,
            headers: {} as Record<string, string>,
            query: { page, size }
        };

        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }

        const response = await $fetch<PaginatedResponse<User>>(`${apiUrl}/user`, options)

        return response
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar usuários',
        })
    }
}

export async function fetchUserById(id: number | string) {
    const auth = useAuth()
    const token = auth.token.value
    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'O usuário não está autenticado',
        })
    }

    try {
        const options = {
            method: 'GET' as const,
            credentials: 'include' as RequestCredentials,
            headers: {} as Record<string, string>,
        };

        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }

        // Typical Laravel resource returns data wrapper for single item as well, or just the object.
        // Assuming it returns { data: User } based on how fetchUsers returns { data: User[] }.
        const response = await $fetch<{ data: User }>(`${apiUrl}/user/${id}`, options)

        return response.data || (response as unknown as User)
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar usuário',
        })
    }
}
