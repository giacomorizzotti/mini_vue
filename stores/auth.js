import { defineStore } from 'pinia'
import { ref, computed} from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useMessage } from '@/mini/composables/useMessage'
const { showMessage }= useMessage()

export const useAuthStore = defineStore('auth', () => {
    
    const router = useRouter()
    const accessToken = ref(localStorage.getItem('accessToken'))
    const refreshToken = ref(localStorage.getItem('refreshToken'))
    const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true')
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
    
    // Computed: extract roles/groups from userInfo
    const userRoles = computed(() => userInfo.value?.groups?.map(g => g.name) || [])
    const userGroups = computed(() => userInfo.value?.groups?.map(g => g.name) || [])

    function setTokens(access=null, refresh=null) {
        if (access) {
            accessToken.value = access
            localStorage.setItem('accessToken', access)
        }
        if (refresh) {
            refreshToken.value = refresh
            localStorage.setItem('refreshToken', refresh)
        }
    }

    function clearTokens() {
        accessToken.value = null
        refreshToken.value = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
    }

    function setUserInfo(info) {
        userInfo.value = info
        localStorage.setItem('userInfo', JSON.stringify(info))
    }
    function clearUserInfo() {
        userInfo.value = null
        localStorage.removeItem('userInfo')
    }

    function setUserGroups(groups) {
        userGroups.value = groups
        localStorage.setItem('userGroups', JSON.stringify(groups))
    }
    function clearUserGroups() {
        userGroups.value = null
        localStorage.removeItem('userGroups')
    }    

    function isTokenExpired(token) {
        if (!token) return true
        try {
        const decoded = jwt_decode(token)
        // exp is in seconds
        return decoded.exp * 1000 < Date.now()
        } catch {
        return true
        }
    }

    async function refreshAccessToken(refreshEndpoint) {
        if (!refreshToken.value) return false
        try {
            const response = await axios.post(refreshEndpoint, {
                refresh: refreshToken.value
            })
            if (response.data.access) {
                setTokens(response.data.access, response.data.refresh)
            }
            if (response.data.access_token && response.data.refresh_token) {
                setTokens(response.data.access_token, response.data.refresh_token)
            }
            return true
        } catch {
            logout()
            return false
        }
    }

    async function resourceOwnerPasswordBased({username, password, clientId, clientSecret, getTokenEndpoint, userInfoEndpoint, scope = 'openid read write introspection groups'}) {
        try {
            const params = new URLSearchParams()
            params.append('grant_type', 'password')
            params.append('username', username)
            params.append('password', password)
            params.append('scope', scope)

            const response = await axios.post(
                getTokenEndpoint, 
                params,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    auth: {
                        username: clientId,
                        password: clientSecret
                    }
                }
            )
            if (response.data.access) {
                setTokens(response.data.access, response.data.refresh)
            }
            if (response.data.access_token && response.data.refresh_token) {
                setTokens(response.data.access_token, response.data.refresh_token)
            }
            isAuthenticated.value = true
            localStorage.setItem('isAuthenticated', 'true')
            await fetchUserInfo(userInfoEndpoint)
            return true
        } catch (e) {
            isAuthenticated.value = false
            localStorage.setItem('isAuthenticated', 'false')
            return false
        }
    }

    async function login({ username, password, getTokenEndpoint, userInfoEndpoint }) {
        try {
            const response = await axios.post(getTokenEndpoint, {
                username,
                password,
            })
            if (response.data.access) {
                setTokens(response.data.access, response.data.refresh)
            }
            if (response.data.access_token && response.data.refresh_token) {
                setTokens(response.data.access_token, response.data.refresh_token)
            }
            isAuthenticated.value = true
            localStorage.setItem('isAuthenticated', 'true')
            await fetchUserInfo(userInfoEndpoint)
            return true
        } catch (e) {
            isAuthenticated.value = false
            localStorage.setItem('isAuthenticated', 'false')
            return false
        }
    }

    function logout() {
        clearTokens()
        clearUserInfo()
        isAuthenticated.value = false
        localStorage.setItem('isAuthenticated', 'false')
        router.push('/')
    }

    async function fetchUserInfo(userInfoEndpoint) {
        if (!accessToken.value) return
        try {
            const response = await axios.get(userInfoEndpoint, {
                headers: { Authorization: `Bearer ${accessToken.value}` }
            })
            setUserInfo(response.data)
            setUserGroups(response.data.groups)
        } catch (e) {
            clearUserInfo()
        }
    }

    function verifyToken() {
        if (!accessToken.value) {
            isAuthenticated.value = false
            localStorage.setItem('isAuthenticated', 'false')
            return false
        }
        // Optionally decode and check expiry
        isAuthenticated.value = true
        localStorage.setItem('isAuthenticated', 'true')
        return true
    }

    async function deepVerifyToken(verifyTokenEndpoint) {
        if (!accessToken.value) {
            isAuthenticated.value = false
            return false
        }
        try {
            await axios.post(verifyTokenEndpoint, { token: accessToken.value })
            isAuthenticated.value = true
            localStorage.setItem('isAuthenticated', 'true')
            return true
        } catch {
            isAuthenticated.value = false
            localStorage.setItem('isAuthenticated', 'false')
            return false
        }
    }

    // Call this before any protected API call
    async function ensureValidToken(refreshEndpoint) {
        if (isTokenExpired(accessToken.value)) {
            return await refreshAccessToken(refreshEndpoint)
        }
        return true
    }

    // Example: check if user has a role
    function hasRole(role) {
        return userRoles.value.includes(role)
    }
    // Example: check if user has a role
    function hasGroup(group) {
        return userGroups.value.includes(group)
    }

    return { 
        accessToken,
        refreshToken, 
        isAuthenticated,
        userInfo,
        userRoles,
        userGroups,
        login, 
        resourceOwnerPasswordBased, 
        refreshAccessToken,
        ensureValidToken,
        logout,
        fetchUserInfo,
        verifyToken, 
        deepVerifyToken,
        hasRole,
        hasGroup,
    }

})