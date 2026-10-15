import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '@/api'

const STORAGE_KEY = 'movieland_session_id'

export const useAuthStore = defineStore('auth', () => {
  const sessionId = ref(localStorage.getItem(STORAGE_KEY) || '')
  const accountId = ref(null)
  const username = ref('')
  const name = ref('')

  const isAuthenticated = computed(() => Boolean(sessionId.value))

  function persist() {
    if (sessionId.value) localStorage.setItem(STORAGE_KEY, sessionId.value)
    else localStorage.removeItem(STORAGE_KEY)
  }

  async function startLogin() {
    const { data } = await api.createRequestToken()
    const redirectTo = `${window.location.origin}${window.location.pathname}`
    window.location.href = `https://www.themoviedb.org/authenticate/${data.request_token}?redirect_to=${encodeURIComponent(redirectTo)}`
  }

  async function completeLogin(requestToken) {
    const { data } = await api.createSession(requestToken)
    sessionId.value = data.session_id
    persist()
    await loadAccount()
  }

  async function loadAccount() {
    if (!sessionId.value) return
    try {
      const { data } = await api.getAccount(sessionId.value)
      accountId.value = data.id
      username.value = data.username
      name.value = data.name || data.username
    } catch (e) {
      await logout()
    }
  }

  async function logout() {
    try {
      if (sessionId.value) await api.deleteSession(sessionId.value)
    } catch (e) {
      // ignore
    }
    sessionId.value = ''
    accountId.value = null
    username.value = ''
    name.value = ''
    persist()
  }

  return {
    sessionId,
    accountId,
    username,
    name,
    isAuthenticated,
    startLogin,
    completeLogin,
    loadAccount,
    logout
  }
})
