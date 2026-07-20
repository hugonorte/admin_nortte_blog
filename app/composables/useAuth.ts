import jwt_decode from "jwt-decode";
import type { User } from "~/types/models";

type LoginOptions = {
    method: 'POST' | 'GET'
    headers: Record<string, string>
    body?: string
    credentials?: RequestCredentials
}

export const useAuth = () => {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl
    const token = useState<string | null>('token', () => null)

    const decodedTokenValue = async () => {
        if (!token.value && import.meta.client) {
            await refreshToken();
        }
        if (token.value) {
            return await jwt_decode(token.value);
        }

        return null
    }

    const user = useState<User | null>('user', () => null)

    const login = async (email: string, password: string) => {
        if (!email || !password) return

        const options: LoginOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', accept: 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        };

        try {
            type LoginResponse = {
                token: string
                id: string
                first_name: string
                last_name: string
                email: string
                role: string
            }
            const data = await $fetch<LoginResponse>(`${apiUrl}/auth/login`, options)
            token.value = data.token

            return data
        }
        catch (error) {
            throw new Error('Login State failed', error as Error)
        }
    }

    const getUser = async () => {
        if (!token.value && import.meta.client) {
            await refreshToken();
        }

        if (!token.value) {
            return null;
        }

        const options = {
            method: 'POST' as const,
            headers: { Authorization: `Bearer ${token.value}` },
        };

        try {
            const data = await $fetch<User>(`${apiUrl}/auth/me`, options)

            // The /auth/me endpoint returns the authenticated user object directly
            if (data) {
                user.value = data;
                return user.value;
            }
            return null;
        }
        catch (error) {
            console.error(error)
            return null
        }
    }

    const logout = async () => {
        try {
            // Chamada ao backend para invalidar o token e limpar o cookie HttpOnly do refresh_token
            await $fetch(`${apiUrl}/auth/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token.value}` },
                credentials: 'include'
            })
        } catch (error) {
            console.error('Erro ao fazer logout no backend', error)
        } finally {
            // Limpa o estado local de forma síncrona independente do retorno da API
            token.value = null
            user.value = null
            navigateTo('/')
        }
    }

    const refreshToken = async () => {
        const options = {
            method: 'POST' as const,
            credentials: 'include' as RequestCredentials,
        };

        try {
            type RefreshResponse = {
                accessToken: string
                tokenType: string
            }
            const data = await $fetch<RefreshResponse>(`${apiUrl}/auth/refresh`, options)
            token.value = data.accessToken
            return
        }
        catch (error) {
            console.error(error)
            return
        }
    }

    return { login, token, getUser, logout, refreshToken, decodedTokenValue }
}