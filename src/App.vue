<template>
  <div :class="{ 'dark-mode': isDarkMode }">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Prompts Manager</a>
        <button class="btn" @click="toggleTheme">
          <font-awesome-icon :icon="isDarkMode ? 'sun' : 'moon'" class="theme-icon" />
        </button>
      </div>
    </nav>

    <div class="container mt-4">
      <div class="row mb-4 search-row">
        <div class="col">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="搜尋提示詞..."
              v-model="searchQuery"
              @keydown.esc.prevent
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
          <button class="btn btn-secondary ms-2" @click="exportPrompts">
            <font-awesome-icon icon="file-export" /> 匯出
          </button>
          <button class="btn btn-secondary ms-2" @click="triggerImport">
            <font-awesome-icon icon="file-import" /> 匯入
          </button>
          <input
            type="file"
            ref="fileInput"
            accept=".json"
            style="display: none"
            @change="handleFileImport"
          >
        </div>
      </div>

      <!-- 類別過濾 -->
      <div class="mb-3">
        <div class="d-flex flex-wrap gap-2">
          <span 
            class="badge bg-secondary cursor-pointer"
            :class="{ 'bg-primary': selectedCategory === null }"
            @click="toggleCategory(null)"
          >
            全部
          </span>
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
        :sort-order="store.sortOrder"
        @edit="editPrompt"
        @delete="deletePrompt"
        @toggle-sort="store.toggleSortOrder"
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
    const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')
    const currentPage = ref(1)
    const pageSize = 10
    const selectedCategory = ref<string | null>(null)
    const fileInput = ref<HTMLInputElement | null>(null)

    // 初始化暗黑模式
    if (isDarkMode.value) {
      document.body.classList.add('dark-mode')
    }

    store.loadPrompts()

    const filteredPrompts = computed(() => {
      let filtered = store.prompts
        .filter(prompt => 
          prompt.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          prompt.category.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
        .sort((a, b) => {
          const dateA = new Date(a.updatedAt).getTime()
          const dateB = new Date(b.updatedAt).getTime()
          return store.sortOrder === 'asc' ? dateA - dateB : dateB - dateA
        })

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

    const toggleCategory = (category: string | null) => {
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
      localStorage.setItem('darkMode', isDarkMode.value.toString())
    }

    const exportPrompts = () => {
      store.exportPrompts()
    }

    const triggerImport = () => {
      fileInput.value?.click()
    }

    const handleFileImport = async (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input.files && input.files.length > 0) {
        try {
          await store.importPrompts(input.files[0])
          alert('匯入成功！')
        } catch (error) {
          alert(`匯入失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
        }
        // 重置檔案輸入
        input.value = ''
      }
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
      toggleTheme,
      fileInput,
      exportPrompts,
      triggerImport,
      handleFileImport,
      store
    }
  }
})
</script>

<style>
.dark-mode {
  background-color: #181a20;
  color: #e4e6eb;
}

.dark-mode .navbar {
  background-color: #23272f !important;
  color: #e4e6eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.dark-mode .navbar-brand {
  color: #f1f1f1;
}

.dark-mode .form-control,
.dark-mode .input-group-text {
  background-color: #23272f;
  border-color: #393e46;
  color: #e4e6eb;
}
.dark-mode .form-control:focus {
  background-color: #23272f;
  border-color: #4b5563;
  color: #f1f1f1;
}

.dark-mode .btn-primary {
  background-color: #2563eb;
  border-color: #2563eb;
  color: #fff;
  box-shadow: 0 2px 8px rgba(37,99,235,0.08);
}
.dark-mode .btn-primary:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}
.dark-mode .btn-secondary {
  background-color: #374151;
  border-color: #4b5563;
  color: #e4e6eb;
}
.dark-mode .btn-secondary:hover {
  background-color: #4b5563;
  border-color: #6b7280;
}
.dark-mode .btn-danger {
  background-color: #ef4444;
  border-color: #ef4444;
  color: #fff;
}
.dark-mode .btn-danger:hover {
  background-color: #dc2626;
  border-color: #dc2626;
}
.dark-mode .btn:disabled, .dark-mode .btn.disabled {
  background-color: #23272f;
  color: #888;
  border-color: #393e46;
  opacity: 0.6;
}

.dark-mode .badge {
  background-color: #2563eb !important;
  color: #fff;
}

.dark-mode .table {
  color: #e4e6eb;
  background-color: #23272f;
}
.dark-mode .table > :not(caption) > * > * {
  background-color: #23272f;
  border-color: #393e46;
}

.dark-mode .pagination .page-link {
  background-color: #23272f;
  border-color: #393e46;
  color: #e4e6eb;
}
.dark-mode .pagination .page-link:hover {
  background-color: #2563eb;
  color: #fff;
}
.dark-mode .pagination .page-item.disabled .page-link {
  background-color: #181a20;
  border-color: #393e46;
  color: #666;
}

.dark-mode .modal-content,
.dark-mode .card {
  background-color: #23272f;
  color: #e4e6eb;
  border-color: #393e46;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}
.dark-mode .modal-header,
.dark-mode .card-header {
  background-color: #23272f;
  border-bottom-color: #393e46;
  color: #f1f1f1;
}
.dark-mode .modal-footer {
  border-top-color: #393e46;
}
.dark-mode .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.dark-mode .preview-content,
.dark-mode .markdown-preview {
  background-color: #23272f;
  color: #e4e6eb;
}

.dark-mode .toast {
  background-color: #2563eb;
  color: #fff;
}

.cursor-pointer {
  cursor: pointer;
}

@media (max-width: 768px) {
  .search-row {
    flex-direction: column !important;
    gap: 0.5rem;
  }
  .search-row > .col,
  .search-row > .col-auto {
    width: 100%;
    max-width: 100%;
  }
  .search-row .input-group {
    width: 100%;
  }
  .search-row .btn {
    width: 100%;
    margin-bottom: 0.25rem;
  }
  .search-row .btn + .btn {
    margin-left: 0 !important;
  }
}

.dark-mode input::placeholder,
.dark-mode textarea::placeholder {
  color: #fff !important;
  opacity: 1;
}
.dark-mode .theme-icon {
  color: #fff !important;
}
</style>
