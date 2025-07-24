import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    configs: {}
  }),
  actions: {
    async loadConfig(url = '/config.json') {
      const res = await fetch(url)
      const data = await res.json()
      this.configs = data
    },
    getConfig() {
      return this.configs
    }
  }
})