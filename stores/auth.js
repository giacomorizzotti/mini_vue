import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    OAUTH_SCOPE,
    OAUTH_TOKEN_ENDPOINT,
    OAUTH_USERINFO_ENDPOINT,
} from '@/config/auth'

const ACCESS_TOKEN_KEY = 'auth.accessToken'
const REFRESH_TOKEN_KEY = 'auth.refreshToken'
const EXPIRES_AT_KEY = 'auth.expiresAt'
const USERINFO_KEY = 'auth.userInfo'

function readJsonFromStorage(key) {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(localStorage.getItem(ACCESS_TOKEN_KEY) || '')
    const refreshToken = ref(localStorage.getItem(REFRESH_TOKEN_KEY) || '')
    const initialExpiresAt = Number(localStorage.getItem(EXPIRES_AT_KEY) || 0)
    const expiresAt = ref(Number.isFinite(initialExpiresAt) ? initialExpiresAt : 0)
    const userInfo = ref(readJsonFromStorage(USERINFO_KEY))
    const isLoading = ref(false)
    const authError = ref('')

    const isAuthenticated = computed(() => Boolean(accessToken.value))
    const authHeaders = computed(() => {
        if (!accessToken.value) return {}
        return { Authorization: `Bearer ${accessToken.value}` }
    })

    function persistTokens({ accessTokenValue, refreshTokenValue, expiresInSeconds }) {
        accessToken.value = accessTokenValue || ''
        refreshToken.value = refreshTokenValue || ''
        expiresAt.value = Date.now() + Number(expiresInSeconds || 0) * 1000

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken.value)
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.value)
        localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt.value))
    }

    function clearSession() {
        accessToken.value = ''
        refreshToken.value = ''
        expiresAt.value = 0
        userInfo.value = null
        authError.value = ''

        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        localStorage.removeItem(EXPIRES_AT_KEY)
        localStorage.removeItem(USERINFO_KEY)
    }

    async function fetchUserInfo(userInfoEndpoint = OAUTH_USERINFO_ENDPOINT) {
        if (!accessToken.value) return null

        const response = await fetch(userInfoEndpoint, {
            headers: {
                ...authHeaders.value,
            },
        })

        if (!response.ok) {
            throw new Error('Unable to load user info')
        }

        const payload = await response.json()
        userInfo.value = payload
        localStorage.setItem(USERINFO_KEY, JSON.stringify(payload))
        return payload
    }

    async function resourceOwnerPasswordBased({
        username,
        password,
        clientId = OAUTH_CLIENT_ID,
        clientSecret = OAUTH_CLIENT_SECRET,
        getTokenEndpoint = OAUTH_TOKEN_ENDPOINT,
        userInfoEndpoint = OAUTH_USERINFO_ENDPOINT,
        scope = OAUTH_SCOPE,
    }) {
        authError.value = ''
        isLoading.value = true

        try {
            const formData = new URLSearchParams()
            formData.set('grant_type', 'password')
            formData.set('username', username)
            formData.set('password', password)
            formData.set('scope', scope)
            formData.set('client_id', clientId)
            if (clientSecret) {
                formData.set('client_secret', clientSecret)
            }

            const response = await fetch(getTokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            })

            const payload = await response.json().catch(() => ({}))

            if (!response.ok || !payload.access_token) {
                const message = payload.error_description || payload.error || 'Invalid credentials'
                throw new Error(message)
            }

            persistTokens({
                accessTokenValue: payload.access_token,
                refreshTokenValue: payload.refresh_token,
                expiresInSeconds: payload.expires_in,
            })

            await fetchUserInfo(userInfoEndpoint).catch(() => null)
            return true
        } catch (error) {
            clearSession()
            authError.value = error instanceof Error ? error.message : 'Login failed'
            return false
        } finally {
            isLoading.value = false
        }
    }

    async function loginWithPassword(username, password) {
        return resourceOwnerPasswordBased({ username, password })
    }

    async function refreshAccessToken(refreshEndpoint = OAUTH_TOKEN_ENDPOINT) {
        if (!refreshToken.value) return false

        const response = await fetch(refreshEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken.value }),
        })

        const payload = await response.json().catch(() => ({}))

        if (!response.ok || !payload.access) {
            clearSession()
            return false
        }

        persistTokens({
            accessTokenValue: payload.access,
            refreshTokenValue: payload.refresh || refreshToken.value,
            expiresInSeconds: payload.expires_in,
        })
        return true
    }

    async function login({ username, password, getTokenEndpoint = OAUTH_TOKEN_ENDPOINT, userInfoEndpoint = OAUTH_USERINFO_ENDPOINT }) {
        authError.value = ''
        isLoading.value = true

        try {
            const response = await fetch(getTokenEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            const payload = await response.json().catch(() => ({}))

            if (!response.ok || !payload.access) {
                const message = payload.detail || payload.error || 'Invalid credentials'
                throw new Error(message)
            }

            persistTokens({
                accessTokenValue: payload.access,
                refreshTokenValue: payload.refresh,
                expiresInSeconds: payload.expires_in,
            })

            await fetchUserInfo(userInfoEndpoint).catch(() => null)
            return true
        } catch (error) {
            clearSession()
            authError.value = error instanceof Error ? error.message : 'Login failed'
            return false
        } finally {
            isLoading.value = false
        }
    }

    async function deepVerifyToken(verifyEndpoint) {
        if (!accessToken.value) return false
        try {
            const response = await fetch(verifyEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: accessToken.value }),
            })
            return response.ok
        } catch {
            return false
        }
    }

    async function ensureValidToken(refreshEndpoint = OAUTH_TOKEN_ENDPOINT) {
        if (!accessToken.value) return false
        if (!Number.isFinite(expiresAt.value) || expiresAt.value <= 0) return true
        if (Date.now() < expiresAt.value - 30000) return true
        return refreshAccessToken(refreshEndpoint)
    }

    function logout() {
        clearSession()
    }

    async function authFetch(input, init = {}) {
        const valid = await ensureValidToken()
        if (!valid || !accessToken.value) {
            throw new Error('Not authenticated')
        }

        const requestHeaders = new Headers(init.headers || {})
        requestHeaders.set('Authorization', `Bearer ${accessToken.value}`)

        return fetch(input, {
            ...init,
            headers: requestHeaders,
        })
    }

    return {
        accessToken,
        refreshToken,
        userInfo,
        isAuthenticated,
        isLoading,
        authError,
        authHeaders,
        login,
        loginWithPassword,
        resourceOwnerPasswordBased,
        refreshAccessToken,
        ensureValidToken,
        deepVerifyToken,
        fetchUserInfo,
        authFetch,
        logout,
    }

})