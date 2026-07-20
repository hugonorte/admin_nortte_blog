const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl;

export interface Role {
    name: string;
    id: string;
}

export async function fetchRoles() {
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

        const response = await $fetch<Role[]>(`${apiUrl}/roles`, options)

        return response
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar roles',
        })
    }
}
