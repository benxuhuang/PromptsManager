import { defineStore } from 'pinia'
import type { Prompt, PromptFormData } from '../types/prompt'

export const usePromptsStore = defineStore('prompts', {
  state: () => ({
    prompts: [] as Prompt[]
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
    }
  }
})
