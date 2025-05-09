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

      <!-- 類別過濾 -->
      <div class="mb-3">
        <div class="d-flex flex-wrap gap-2">
          <span 
            v-for="category in uniqueCategories" 
            :key="category"
            class="badge bg-primary cursor-pointer"
            :class="{ 'bg-primary': selectedCategory === category }"
            @click="toggleCategory(category)"
          >
            {{ category }}
          </span>
        </div>
      </div>

      <PromptList 
        :prompts="paginatedPrompts"
        @edit="editPrompt"
        @delete="deletePrompt"
      />

      <!-- 分頁控制 -->
      <div class="d-flex justify-content-center mt-4">
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="currentPage--">上一頁</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="currentPage++">下一頁</a>
            </li>
          </ul>
        </nav>
      </div>
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
    const currentPage = ref(1)
    const pageSize = 10
    const selectedCategory = ref<string | null>(null)

    store.loadPrompts()

    const filteredPrompts = computed(() => {
      let filtered = store.prompts
        .filter(prompt => 
          prompt.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          prompt.category.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

      if (selectedCategory.value) {
        filtered = filtered.filter(prompt => 
          prompt.category.split(',').map(cat => cat.trim()).includes(selectedCategory.value!)
        )
      }

      return filtered
    })

    const uniqueCategories = computed(() => {
      const categories = new Set<string>()
      store.prompts.forEach(prompt => {
        prompt.category.split(',').forEach(cat => categories.add(cat.trim()))
      })
      return Array.from(categories)
    })

    const totalPages = computed(() => 
      Math.ceil(filteredPrompts.value.length / pageSize)
    )

    const paginatedPrompts = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      const end = start + pageSize
      return filteredPrompts.value.slice(start, end)
    })

    const toggleCategory = (category: string) => {
      selectedCategory.value = selectedCategory.value === category ? null : category
      currentPage.value = 1
    }

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
      paginatedPrompts,
      currentPage,
      totalPages,
      uniqueCategories,
      selectedCategory,
      toggleCategory,
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

.cursor-pointer {
  cursor: pointer;
}

.dark-mode .pagination .page-link {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #ffffff;
}

.dark-mode .pagination .page-item.disabled .page-link {
  background-color: #1a1a1a;
  border-color: #404040;
  color: #666666;
}
</style>
