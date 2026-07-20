import type { Category } from '~/types/models';
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl;

interface CategoryData {
    message: string;
    category: Category;
}

export async function fetchCategories() {
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

        interface PaginatedResponse<T> {
            content: T[];
            totalPages: number;
            totalElements: number;
        }

        const response = await $fetch<PaginatedResponse<Category>>(`${apiUrl}/category`, options)

        return response.content
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar categorias',
        })
    }
}

export async function fetchCategoryById(id: string | number) {
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

        const response = await $fetch<{ data: Category }>(`${apiUrl}/category/${id}`, options)

        return response.data || (response as unknown as Category)
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar categoria',
        })
    }
}

