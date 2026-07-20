import type { Post } from '~/types/models';
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl;

import type { PostRequestDTO } from './post';

export async function updatePost(id: string, data: PostRequestDTO) : Promise<Post> {
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
            method: 'PUT' as const,
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

        const response = await $fetch<Post>(`${apiUrl}/post/${id}`, options)

        return response
    }
    catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao atualizar post',
        })
    }
}

export async function updatePostStatus(id: string, status: string) : Promise<Post> {
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
            method: 'PATCH' as const,
            credentials: 'include' as RequestCredentials,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            } as Record<string, string>,
        };

        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }

        const response = await $fetch<Post>(`${apiUrl}/post/${id}/status?status=${status}`, options)

        return response
    }
    catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao atualizar status do post',
        })
    }
}
