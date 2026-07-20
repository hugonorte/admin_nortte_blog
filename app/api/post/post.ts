import type { Post } from '~/types/models';
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl;

export interface PostRequestDTO {
    title: string;
    slug: string;
    content: string;
    tldr: string;
    imagePath?: string;
    publishedAt?: string;
    categoryId: string;
    authorId: string;
    status: string;
    formatType: string;
}

export async function createPost(data: PostRequestDTO) : Promise<Post> {
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
            method: 'POST' as const,
            body: data,
            credentials: 'include' as RequestCredentials,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            } as Record<string, string>,
        };

        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }

        const response = await $fetch<Post>(`${apiUrl}/post`, options)

        return response
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao criar post',
        })
    }
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export async function fetchPosts() : Promise<PaginatedResponse<Post>> {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl;
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
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            } as Record<string, string>,
        };

        const response = await $fetch<PaginatedResponse<Post>>(`${apiUrl}/post`, options)
        return response
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar posts',
        })
    }
}

