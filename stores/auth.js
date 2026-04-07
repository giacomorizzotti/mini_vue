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
const REFRESH_ENDPOINT_KEY = 'auth.refreshEndpoint'

// Decode the `exp` claim from a JWT (milliseconds)
function getJwtExp(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        return typeof payload.exp === 'number' ? payload.exp * 1000 : 0
    } catch {
        return 0
    }
}

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
    const _refreshEndpoint = ref(localStorage.getItem(REFRESH_ENDPOINT_KEY) || OAUTH_TOKEN_ENDPOINT)
    const userInfo = ref(readJsonFromStorage(USERINFO_KEY))
    const isLoading = ref(false)
    const authError = ref('')

    const isAuthenticated = computed(() => {
        if (!accessToken.value) return false
        // Consider expired if we know the expiry and it has already passed
        if (expiresAt.value > 0 && Date.now() >= expiresAt.value) return false
        return true
    })
    const authHeaders = computed(() => {
        if (!accessToken.value) return {}
        return { Authorization: `Bearer ${accessToken.value}` }
    })

    function persistTokens({ accessTokenValue, refreshTokenValue, expiresInSeconds, refreshEndpoint }) {
        accessToken.value = accessTokenValue || ''
        refreshToken.value = refreshTokenValue || ''

        if (expiresInSeconds) {
            expiresAt.value = Date.now() + Number(expiresInSeconds) * 1000
        } else if (accessTokenValue) {
            // Fall back to reading the exp claim directly from the JWT
            expiresAt.value = getJwtExp(accessTokenValue)
        } else {
            expiresAt.value = 0
        }

        if (refreshEndpoint) {
            _refreshEndpoint.value = refreshEndpoint
            localStorage.setItem(REFRESH_ENDPOINT_KEY, refreshEndpoint)
        }

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
        localStorage.removeItem(REFRESH_ENDPOINT_KEY)
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

    async function refreshAccessToken(
        refreshEndpoint = OAUTH_TOKEN_ENDPOINT,
        { useSimpleJwtCompat = true, clientId = OAUTH_CLIENT_ID, clientSecret = OAUTH_CLIENT_SECRET } = {},
    ) {
        if (!refreshToken.value) return false

        let response
        if (useSimpleJwtCompat) {
            // Django simplejwt: POST JSON { refresh } → { access, refresh }
            response = await fetch(refreshEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken.value }),
            })
        } else {
            // RFC 6749 §6: form-encoded grant_type=refresh_token
            const formData = new URLSearchParams()
            formData.set('grant_type', 'refresh_token')
            formData.set('refresh_token', refreshToken.value)
            formData.set('client_id', clientId)
            if (clientSecret) formData.set('client_secret', clientSecret)
            response = await fetch(refreshEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString(),
            })
        }

        const payload = await response.json().catch(() => ({}))

        if (useSimpleJwtCompat) {
            if (!response.ok || !payload.access) { clearSession(); return false }
            persistTokens({
                accessTokenValue: payload.access,
                refreshTokenValue: payload.refresh || refreshToken.value,
                expiresInSeconds: payload.expires_in,
            })
        } else {
            if (!response.ok || !payload.access_token) { clearSession(); return false }
            persistTokens({
                accessTokenValue: payload.access_token,
                refreshTokenValue: payload.refresh_token || refreshToken.value,
                expiresInSeconds: payload.expires_in,
            })
        }
        return true
    }

    // Django simplejwt-specific login: POST JSON { username, password } → { access, refresh }
    // For standard OAuth2, use loginWithPassword() / resourceOwnerPasswordBased() instead.
    async function loginSimpleJwt({ username, password, getTokenEndpoint = OAUTH_TOKEN_ENDPOINT, userInfoEndpoint = OAUTH_USERINFO_ENDPOINT }) {
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

            // Derive refresh endpoint from the obtain endpoint (simplejwt convention)
            const derivedRefreshEndpoint = getTokenEndpoint.replace(/token\/?$/, 'token/refresh/')

            persistTokens({
                accessTokenValue: payload.access,
                refreshTokenValue: payload.refresh,
                expiresInSeconds: payload.expires_in,
                refreshEndpoint: derivedRefreshEndpoint,
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

    // Backward-compatible alias — prefer loginSimpleJwt() or loginWithPassword() explicitly
    const login = loginSimpleJwt

    // Django simplejwt-specific: POST JSON { token } to /api/token/verify/
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

    // RFC 7662 token introspection — works with any standards-compliant OAuth2 server
    async function introspectToken(
        introspectionEndpoint,
        { clientId = OAUTH_CLIENT_ID, clientSecret = OAUTH_CLIENT_SECRET } = {},
    ) {
        if (!accessToken.value) return false
        try {
            const formData = new URLSearchParams()
            formData.set('token', accessToken.value)
            if (clientId) formData.set('client_id', clientId)
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
            // Prefer HTTP Basic auth for client credentials (RFC 7662 §2.1)
            if (clientId && clientSecret) {
                headers['Authorization'] = 'Basic ' + btoa(`${clientId}:${clientSecret}`)
            }
            const response = await fetch(introspectionEndpoint, {
                method: 'POST',
                headers,
                body: formData.toString(),
            })
            if (!response.ok) return false
            const payload = await response.json().catch(() => ({}))
            return payload.active === true
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
        const refreshEndpoint = _refreshEndpoint.value
        const valid = await ensureValidToken(refreshEndpoint)
        if (!valid || !accessToken.value) {
            throw new Error('Not authenticated')
        }

        const requestHeaders = new Headers(init.headers || {})
        requestHeaders.set('Authorization', `Bearer ${accessToken.value}`)

        const response = await fetch(input, {
            ...init,
            headers: requestHeaders,
        })

        // On 401, refresh once and retry
        if (response.status === 401 && refreshToken.value) {
            const refreshed = await refreshAccessToken(refreshEndpoint)
            if (refreshed) {
                const retryHeaders = new Headers(init.headers || {})
                retryHeaders.set('Authorization', `Bearer ${accessToken.value}`)
                return fetch(input, { ...init, headers: retryHeaders })
            }
            throw new Error('Not authenticated')
        }

        return response
    }

    return {
        accessToken,
        refreshToken,
        userInfo,
        isAuthenticated,
        isLoading,
        authError,
        authHeaders,
        login,            // alias for loginSimpleJwt — kept for backward compat
        loginSimpleJwt,
        loginWithPassword,
        resourceOwnerPasswordBased,
        refreshAccessToken,
        ensureValidToken,
        deepVerifyToken,
        introspectToken,
        fetchUserInfo,
        authFetch,
        logout,
    }

})