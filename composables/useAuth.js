import { ref } from 'vue'
import axios from 'axios'
import { useMessage } from '@/mini/composables/useMessage'
const { showMessage }= useMessage()
import { useRouter } from 'vue-router'

export function useAuth(getTokenEndpoint, verifyTokenEndpoint) {

    const router = useRouter()
    const accessToken = ref(localStorage.getItem('accessToken'))
    const refreshToken = ref(localStorage.getItem('refreshToken'))
    const isAuthenticated = ref(false)

    async function resourceOwnerPasswordBased(username, password, clientId, clientSecret) {
        try {
            const response = await axios.post(getTokenEndpoint, {
                grant_type: "password",
                username,
                password,
                client_id: clientId,
                client_secret: clientSecret
            }, 
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                transformRequest: [(data) => {
                    return Object.entries(data).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
                }]
            })
            // Save tokens to localStorage or Vuex
            localStorage.setItem('accessToken', response.data.access_token)
            localStorage.setItem('refreshToken', response.data.refresh_token)
            localStorage.setItem('isAuthenticated', true)
            isAuthenticated.value=true
            // Redirect or update UI
            showMessage('Login eseguito con successo', 'success')
            router.push('/')
            //console.log(response.data)
            return response.data
        } catch (e) {
            showMessage('Login non riuscito', "warning")
            //console.log(e)
            return false
        }
    }

    async function basicAuth(username, password) {
        try {
            const response = await axios.post(getTokenEndpoint, {
                username: username,
                password: password,
            })
            // Save tokens to localStorage or Vuex
            localStorage.setItem('accessToken', response.data.access)
            localStorage.setItem('refreshToken', response.data.refresh)
            localStorage.setItem('isAuthenticated', true)
            isAuthenticated.value=true
            // Redirect or update UI
            showMessage('Login eseguito con successo', 'success')
            router.push('/')
            return response.data
        } catch (e) {
            showMessage('Login non riuscito', "warning")
            //console.log(e)
            return false
        }
    }

    function checkAccess() {
        if (localStorage.isAuthenticated == 'true') {
            isAuthenticated.value = true
            return true
        }
        return false
    }

    function verifyToken() {
        if (!accessToken.value) {
            isAuthenticated.value = false
            return false
        }
        return false
    }

    async function deepVerifyToken() {
        if (!accessToken.value) {
            isAuthenticated.value = false
            return false
        }
        try {
            await axios.post(verifyTokenEndpoint, { token: accessToken.value })
            isAuthenticated.value = true
            return true
        } catch {
            isAuthenticated.value = false
            return false
        }
    }

    function clearLocalStorage() {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('isAuthenticated')
        isAuthenticated.value = false
        showMessage('Logout eseguito con successo', 'success')
        router.push('/')
        return true
    }

    return { basicAuth, resourceOwnerPasswordBased, isAuthenticated, checkAccess, verifyToken, deepVerifyToken, clearLocalStorage }
}