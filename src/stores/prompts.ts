import { defineStore } from 'pinia'
import type { Prompt, PromptFormData } from '../types/prompt'

export const usePromptsStore = defineStore('prompts', {
  state: () => ({
    prompts: [] as Prompt[],
    sortOrder: 'desc' as 'asc' | 'desc'
  }),

  actions: {
    loadPrompts() {
      console.log('Loading prompts from storage...')
      if (typeof Storage !== 'undefined') {
        const savedPrompts = localStorage.getItem('prompts')
        if (savedPrompts) {
          this.prompts = JSON.parse(savedPrompts)
          console.log('Prompts loaded:', this.prompts)
        } else {
          console.log('No prompts found in storage.')
        }
      } else {
        console.warn('Local storage is not available. Using session storage as fallback.')
        const savedPrompts = sessionStorage.getItem('prompts')
        if (savedPrompts) {
          this.prompts = JSON.parse(savedPrompts)
          console.log('Prompts loaded from session storage:', this.prompts)
        } else {
          console.log('No prompts found in session storage.')
        }
      }
    },

    saveToLocalStorage() {
      console.log('Saving prompts to storage...')
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('prompts', JSON.stringify(this.prompts))
        console.log('Prompts saved to local storage.')
      } else {
        console.warn('Local storage is not available. Using session storage as fallback.')
        sessionStorage.setItem('prompts', JSON.stringify(this.prompts))
        console.log('Prompts saved to session storage.')
      }
    },

    addPrompt(promptData: PromptFormData) {
      console.log('Adding new prompt:', promptData)
      const prompt: Prompt = {
        id: crypto.randomUUID(),
        ...promptData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      this.prompts.push(prompt)
      this.saveToLocalStorage()
      console.log('Prompt added:', prompt)
    },

    updatePrompt(promptData: Prompt) {
      console.log('Updating prompt:', promptData)
      const index = this.prompts.findIndex(p => p.id === promptData.id)
      if (index !== -1) {
        this.prompts[index] = {
          ...promptData,
          updatedAt: new Date().toISOString()
        }
        this.saveToLocalStorage()
        console.log('Prompt updated:', this.prompts[index])
      } else {
        console.warn('Prompt not found:', promptData.id)
      }
    },

    deletePrompt(id: string) {
      console.log('Deleting prompt with id:', id)
      const index = this.prompts.findIndex(p => p.id === id)
      if (index !== -1) {
        const deletedPrompt = this.prompts.splice(index, 1)
        this.saveToLocalStorage()
        console.log('Prompt deleted:', deletedPrompt)
      } else {
        console.warn('Prompt not found:', id)
      }
    },

    exportPrompts() {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        prompts: this.prompts
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date()
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}-${String(date.getSeconds()).padStart(2, '0')}`
      a.download = `prompts-export-${formattedDate}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    importPrompts(file: File): Promise<void> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            if (data.version && data.prompts && Array.isArray(data.prompts)) {
              // 比對現有資料並更新
              const existingPrompts = new Map(this.prompts.map((p: Prompt) => [p.id, p]))
              const importedPrompts = new Map(data.prompts.map((p: Prompt) => [p.id, p]))
              
              // 更新或新增匯入的提示詞
              data.prompts.forEach((importedPrompt: Prompt) => {
                const existingPrompt = existingPrompts.get(importedPrompt.id)
                if (existingPrompt) {
                  // 如果存在相同 ID 的提示詞，更新它
                  this.updatePrompt(importedPrompt)
                } else {
                  // 如果是新的提示詞，新增它
                  this.prompts.push(importedPrompt)
                }
              })
              
              this.saveToLocalStorage()
              resolve()
            } else {
              reject(new Error('無效的匯入檔案格式'))
            }
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = () => reject(new Error('讀取檔案失敗'))
        reader.readAsText(file)
      })
    },

    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    }
  }
})
