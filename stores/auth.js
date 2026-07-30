import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    OAUTH_SCOPE,
    OAUTH_TOKEN_ENDPOINT,
    OAUTH_REVOKE_ENDPOINT,
    OAUTH_USERINFO_ENDPOINT,
} from '@/config/auth'

function generateCodeVerifier() {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

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

function tokenFormData(grantFields) {
    const formData = new URLSearchParams()
    for (const [key, value] of Object.entries(grantFields)) {
        formData.set(key, value)
    }
    formData.set('client_id', OAUTH_CLIENT_ID)
    if (OAUTH_CLIENT_SECRET) {
        formData.set('client_secret', OAUTH_CLIENT_SECRET)
    }
    return formData
}

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(localStorage.getItem(ACCESS_TOKEN_KEY) || '')
    const refreshToken = ref(localStorage.getItem(REFRESH_TOKEN_KEY) || '')
    const initialExpiresAt = Number(localStorage.getItem(EXPIRES_AT_KEY) || 0)
    const expiresAt = ref(Number.isFinite(initialExpiresAt) ? initialExpiresAt : 0)
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

    function persistTokens({ accessTokenValue, refreshTokenValue, expiresInSeconds }) {
        accessToken.value = accessTokenValue || ''
        refreshToken.value = refreshTokenValue || ''
        expiresAt.value = expiresInSeconds ? Date.now() + Number(expiresInSeconds) * 1000 : 0

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

    async function fetchUserInfo() {
        if (!accessToken.value) return null

        const response = await fetch(OAUTH_USERINFO_ENDPOINT, {
            headers: { ...authHeaders.value },
        })

        if (!response.ok) {
            throw new Error('Unable to load user info')
        }

        const payload = await response.json()
        userInfo.value = payload
        localStorage.setItem(USERINFO_KEY, JSON.stringify(payload))
        return payload
    }

    async function loginWithPassword(username, password) {
        authError.value = ''
        isLoading.value = true

        try {
            const formData = tokenFormData({
                grant_type: 'password',
                username,
                password,
                scope: OAUTH_SCOPE,
            })

            const response = await fetch(OAUTH_TOKEN_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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

            await fetchUserInfo().catch(() => null)
            return true
        } catch (error) {
            clearSession()
            authError.value = error instanceof Error ? error.message : 'Login failed'
            return false
        } finally {
            isLoading.value = false
        }
    }

    // RFC 6749 §6 — form-encoded grant_type=refresh_token against the same
    // OAuth2 token endpoint used for login (this server doesn't speak simplejwt).
    async function refreshAccessToken() {
        if (!refreshToken.value) return false

        const formData = tokenFormData({
            grant_type: 'refresh_token',
            refresh_token: refreshToken.value,
        })

        const response = await fetch(OAUTH_TOKEN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        })

        const payload = await response.json().catch(() => ({}))

        if (!response.ok || !payload.access_token) {
            clearSession()
            return false
        }

        persistTokens({
            accessTokenValue: payload.access_token,
            refreshTokenValue: payload.refresh_token || refreshToken.value,
            expiresInSeconds: payload.expires_in,
        })
        return true
    }

    // RFC 7662 token introspection — ask the auth server whether the current
    // access token is still active. Pass the server's introspection endpoint
    // (e.g. `${AUTH_SERVER_BASE}/o/introspect/`).
    async function introspectToken(introspectionEndpoint, { clientId = OAUTH_CLIENT_ID, clientSecret = OAUTH_CLIENT_SECRET } = {}) {
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

    async function ensureValidToken() {
        if (!accessToken.value) return false
        if (!Number.isFinite(expiresAt.value) || expiresAt.value <= 0) return true
        if (Date.now() < expiresAt.value - 30000) return true
        return refreshAccessToken()
    }

    // RFC 7009 token revocation. Hint refresh_token specifically — the auth
    // server's revoke_token endpoint cascades a refresh-token revocation to
    // its access token, but revoking only the access token leaves the refresh
    // token alive (able to silently mint new access tokens after "logout").
    //
    // Clear the local session first (synchronously) so isAuthenticated flips
    // immediately — callers that navigate right after logout() shouldn't race
    // a still-true isAuthenticated against a guestOnly router guard. The
    // server-side revocation is then fired off best-effort in the background.
    function logout() {
        const tokenToRevoke = refreshToken.value
        clearSession()

        if (tokenToRevoke && OAUTH_REVOKE_ENDPOINT) {
            const formData = tokenFormData({
                token: tokenToRevoke,
                token_type_hint: 'refresh_token',
            })
            fetch(OAUTH_REVOKE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString(),
            }).catch(() => {})
        }
    }

    // Same PKCE setup initiateLogin() below navigates with immediately, but
    // returned instead of navigated to — for a caller that needs to detour
    // through another page first (e.g. an invite-gated registration form on
    // the auth server) before continuing the authorization-code flow.
    async function buildAuthorizeUrl(authorizeEndpoint, redirectUri) {
        const verifier = generateCodeVerifier()
        const challenge = await generateCodeChallenge(verifier)
        const state = generateCodeVerifier()

        sessionStorage.setItem('pkce_verifier', verifier)
        sessionStorage.setItem('pkce_state', state)

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: OAUTH_CLIENT_ID,
            redirect_uri: redirectUri,
            scope: OAUTH_SCOPE,
            code_challenge: challenge,
            code_challenge_method: 'S256',
            state,
        })

        return `${authorizeEndpoint}?${params.toString()}`
    }

    async function initiateLogin(authorizeEndpoint, redirectUri) {
        window.location.href = await buildAuthorizeUrl(authorizeEndpoint, redirectUri)
    }

    async function handleCallback(code, redirectUri) {
        authError.value = ''
        isLoading.value = true
        try {
            const verifier = sessionStorage.getItem('pkce_verifier')
            sessionStorage.removeItem('pkce_verifier')
            sessionStorage.removeItem('pkce_state')

            if (!verifier) throw new Error('Missing PKCE verifier')

            const formData = new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: OAUTH_CLIENT_ID,
                code_verifier: verifier,
                redirect_uri: redirectUri,
            })

            const response = await fetch(OAUTH_TOKEN_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString(),
            })

            const payload = await response.json().catch(() => ({}))

            if (!response.ok || !payload.access_token) {
                throw new Error(payload.error_description || payload.error || 'Token exchange failed')
            }

            persistTokens({
                accessTokenValue: payload.access_token,
                refreshTokenValue: payload.refresh_token,
                expiresInSeconds: payload.expires_in,
            })

            await fetchUserInfo().catch(() => null)
            return true
        } catch (error) {
            clearSession()
            authError.value = error instanceof Error ? error.message : 'Login failed'
            return false
        } finally {
            isLoading.value = false
        }
    }

    async function authFetch(input, init = {}) {
        const valid = await ensureValidToken()
        if (!valid || !accessToken.value) {
            throw new Error('Not authenticated')
        }

        const requestHeaders = new Headers(init.headers || {})
        requestHeaders.set('Authorization', `Bearer ${accessToken.value}`)

        const response = await fetch(input, {
            ...init,
            headers: requestHeaders,
        })

        // On an auth failure, refresh once and retry. APIs are inconsistent
        // about 401 vs 403 for an invalid/expired/revoked bearer token (DRF
        // falls back to 403 when no WWW-Authenticate challenge is set), so
        // treat both as "might need a fresh token" — if the refresh token is
        // also dead, refreshAccessToken() clears the session, which flips
        // isAuthenticated to false and the UI updates accordingly.
        if ((response.status === 401 || response.status === 403) && refreshToken.value) {
            const refreshed = await refreshAccessToken()
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
        loginWithPassword,
        buildAuthorizeUrl,
        initiateLogin,
        handleCallback,
        refreshAccessToken,
        ensureValidToken,
        introspectToken,
        fetchUserInfo,
        authFetch,
        logout,
    }

})
