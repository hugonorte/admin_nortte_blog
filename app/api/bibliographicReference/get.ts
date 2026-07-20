import type { BibliographicReference } from '~/types/models';
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl;

interface BibliographicReferenceData {
    message: string;
    bibliographicReference: BibliographicReference;
}

export async function fetchBibliographicReferences() {
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

        const response = await $fetch<BibliographicReference[]>(`${apiUrl}/bibliographic_reference`, options)

        return response
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar referências bibliográficas',
        })
    }
}

export async function fetchBibliographicReferenceById(id: number) {
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

        const response = await $fetch<BibliographicReference[]>(`${apiUrl}/bibliographic_reference/${id}`, options)

        return response
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar referências bibliográficas',
        })
    }
}

export async function fetchBibliographicReferenceByPostId(postId: number) {
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

        const response = await $fetch<BibliographicReference[]>(`${apiUrl}/bibliographic_reference/post/${postId}`, options)

        return response
    }
    catch (error: any) {
        if (error.statusCode === 404 || error.response?.status === 404) {
            return []
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar referências bibliográficas',
        })
    }
}

