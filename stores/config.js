import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    configs: {}
  }),
  actions: {
    async loadConfig(url = '/config.json') {
      const res = await fetch(url)
      const data = await res.json()
      
      // In production, use full API URL; in development, use relative URLs for proxy
      if (import.meta.env.PROD) {
        data.apiUrl = 'https://brff2.doingthings.space/'
      }
      
      this.configs = data
    },
    getConfig() {
      return this.configs
    }
  }
})