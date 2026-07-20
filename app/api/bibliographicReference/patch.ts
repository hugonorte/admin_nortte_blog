import type { BibliographicReference } from '~/types/models';
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl;

export async function updateBibliographicReference(id: string, description: string) {
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
            body: {
                id: id,
                description: description
            },
            credentials: 'include' as RequestCredentials,
            headers: {
                'Accept': 'application/json'
            } as Record<string, string>,
        };

        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }

        const response = await $fetch(`${apiUrl}/bibliographic_reference/${id}`, options)

        return response
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao atualizar referência bibliográfica',
        })
    }
}

