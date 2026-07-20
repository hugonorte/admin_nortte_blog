import type { Author } from '~/types/models';
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl;

interface AuthorData {
    message: string;
    author: Author;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export async function fetchAuthors(page: number = 0, size: number = 20) {
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

        const response = await $fetch<PaginatedResponse<Author>>(`${apiUrl}/author`, options)

        return response
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar autores',
        })
    }
}

export async function fetchAuthorById(id: number | string) {
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

        const response = await $fetch<{ data: Author }>(`${apiUrl}/author/${id}`, options)

        return response.data || (response as unknown as Author)
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar autor',
        })
    }
}
