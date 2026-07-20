export interface UploadResponse {
    path: string;
}

export async function uploadFile(file: File, type: 'post' | 'avatar'): Promise<string> {
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
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const options = {
            method: 'POST' as const,
            body: formData,
            credentials: 'include' as RequestCredentials,
            headers: {} as Record<string, string>,
        };

        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }

        // ofetch handles FormData and sets the correct boundary
        const response = await $fetch<UploadResponse>(`${apiUrl}/upload`, options)

        return response.path;
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao enviar arquivo',
        })
    }
}
