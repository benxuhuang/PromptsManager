<template>
  <div :class="{ 'dark-mode': isDarkMode }">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Prompts Manager</a>
        <button class="btn" @click="toggleTheme">
          <font-awesome-icon :icon="isDarkMode ? 'sun' : 'moon'" />
        </button>
      </div>
    </nav>

    <div class="container mt-4">
      <div class="row mb-4">
        <div class="col">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="搜尋提示詞..."
              v-model="searchQuery"
            >
            <span class="input-group-text">
              <font-awesome-icon icon="search" />
            </span>
          </div>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" @click="openCreateModal">
            <font-awesome-icon icon="plus" /> 新增提示詞
          </button>
        </div>
      </div>

      <PromptList 
        :prompts="filteredPrompts"
        @edit="editPrompt"
        @delete="deletePrompt"
      />
    </div>

    <PromptModal
      v-if="showModal"
      :prompt="currentPrompt"
      @save="savePrompt"
      @close="closeModal"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { usePromptsStore } from './stores/prompts'
import PromptList from './components/PromptList.vue'
import PromptModal from './components/PromptModal.vue'
import type { Prompt } from './types/prompt'

export default defineComponent({
  name: 'App',
  components: {
    PromptList,
    PromptModal
  },
  setup() {
    const store = usePromptsStore()
    const searchQuery = ref('')
    const showModal = ref(false)
    const currentPrompt = ref<Prompt | null>(null)
    const isDarkMode = ref(false)

    const filteredPrompts = computed(() => {
      return store.prompts.filter(prompt => 
        prompt.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        prompt.category.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const openCreateModal = () => {
      currentPrompt.value = null
      showModal.value = true
    }

    const editPrompt = (prompt: Prompt) => {
      currentPrompt.value = { ...prompt }
      showModal.value = true
    }

    const savePrompt = (prompt: Prompt) => {
      if (currentPrompt.value) {
        store.updatePrompt(prompt)
      } else {
        store.addPrompt(prompt)
      }
      closeModal()
    }

    const deletePrompt = (id: string) => {
      if (confirm('確定要刪除這個提示詞嗎？')) {
        store.deletePrompt(id)
      }
    }

    const closeModal = () => {
      showModal.value = false
      currentPrompt.value = null
    }

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      document.body.classList.toggle('dark-mode')
    }

    return {
      searchQuery,
      showModal,
      currentPrompt,
      isDarkMode,
      filteredPrompts,
      openCreateModal,
      editPrompt,
      savePrompt,
      deletePrompt,
      closeModal,
      toggleTheme
    }
  }
})
</script>

<style>
.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

.dark-mode .navbar {
  background-color: #2d2d2d !important;
}

.dark-mode .navbar-brand {
  color: #ffffff;
}

.dark-mode .form-control,
.dark-mode .input-group-text {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #ffffff;
}

.dark-mode .btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.dark-mode .btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}
</style> 