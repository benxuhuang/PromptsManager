import { defineStore } from 'pinia'
import type { Prompt, PromptFormData } from '../types/prompt'

export const usePromptsStore = defineStore('prompts', {
  state: () => ({
    prompts: [] as Prompt[]
  }),

  actions: {
    loadPrompts() {
      const savedPrompts = localStorage.getItem('prompts')
      if (savedPrompts) {
        this.prompts = JSON.parse(savedPrompts)
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('prompts', JSON.stringify(this.prompts))
    },

    addPrompt(promptData: PromptFormData) {
      const prompt: Prompt = {
        id: crypto.randomUUID(),
        ...promptData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      this.prompts.push(prompt)
      this.saveToLocalStorage()
    },

    updatePrompt(promptData: Prompt) {
      const index = this.prompts.findIndex(p => p.id === promptData.id)
      if (index !== -1) {
        this.prompts[index] = {
          ...promptData,
          updatedAt: new Date().toISOString()
        }
        this.saveToLocalStorage()
      }
    },

    deletePrompt(id: string) {
      const index = this.prompts.findIndex(p => p.id === id)
      if (index !== -1) {
        this.prompts.splice(index, 1)
        this.saveToLocalStorage()
      }
    }
  }
}) 