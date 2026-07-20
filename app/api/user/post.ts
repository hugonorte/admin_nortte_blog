import type { User } from '~/types/models';
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl;

export async function createUser(data: User & { password?: string }) : Promise<User> {
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
            headers: {} as Record<string, string>,
        };

        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }

        const response = await $fetch<User>(`${apiUrl}/user`, options)

        return response
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao criar usuário',
        })
    }
}
