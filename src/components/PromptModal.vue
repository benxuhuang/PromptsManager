<template>
  <div class="modal d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ prompt ? '編輯提示詞' : '新增提示詞' }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">標題</label>
              <input
                type="text"
                class="form-control"
                v-model="form.title"
                required
              >
            </div>
            <div class="mb-3">
              <label class="form-label">類別</label>
              <input
                type="text"
                class="form-control"
                v-model="form.category"
                placeholder="請輸入類別，多個類別請用逗號分隔"
              >
              <div class="mt-2">
                <div class="d-flex flex-wrap gap-2">
                  <span 
                    v-for="category in uniqueCategories" 
                    :key="category"
                    class="badge bg-primary cursor-pointer"
                    @click="selectCategory(category)"
                  >
                    {{ category }}
                  </span>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">內容</label>
              <textarea
                class="form-control font-monospace mb-3"
                v-model="form.content"
                rows="10"
                required
              ></textarea>
              <div class="card">
                <div class="card-header">
                  預覽
                </div>
                <div class="card-body markdown-preview">
                  <div v-html="markdownPreview"></div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="handleSubmit">
            儲存
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>

  <!-- 欄位未填寫通知 -->
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div class="toast" :class="{ show: showToast }" role="alert">
      <div class="toast-body">
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import type { Prompt } from '../types/prompt'
import { usePromptsStore } from '../stores/prompts'

export default defineComponent({
  name: 'PromptModal',
  props: {
    prompt: {
      type: Object as () => Prompt | null,
      default: null
    }
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const store = usePromptsStore()
    const form = ref({
      title: '',
      category: '',
      content: ''
    })

    const uniqueCategories = computed(() => {
      const categories = new Set<string>()
      store.prompts.forEach(prompt => {
        prompt.category.split(',').forEach(cat => categories.add(cat.trim()))
      })
      return Array.from(categories)
    })

    const selectCategory = (category: string) => {
      if (form.value.category) {
        const categories = form.value.category.split(',').map(cat => cat.trim())
        if (!categories.includes(category)) {
          categories.push(category)
          form.value.category = categories.join(', ')
        }
      } else {
        form.value.category = category
      }
    }

    const markdownPreview = computed(() => {
      return marked(form.value.content)
    })

    const showToast = ref(false)
    const toastMessage = ref('')

    onMounted(() => {
      if (props.prompt) {
        form.value = {
          title: props.prompt.title,
          category: props.prompt.category,
          content: props.prompt.content
        }
      } else {
        form.value = {
          title: '',
          category: '',
          content: '\n\n`text`'
        }
      }
    })

    const handleSubmit = () => {
      if (!form.value.title) {
        showToast.value = true
        toastMessage.value = '標題未填寫'
        setTimeout(() => { showToast.value = false }, 2000)
        return
      }
      if (!form.value.category) {
        showToast.value = true
        toastMessage.value = '類別未填寫'
        setTimeout(() => { showToast.value = false }, 2000)
        return
      }
      if (form.value.title && form.value.category && form.value.content) {
        const promptData = {
          ...form.value
        }
        if (props.prompt) {
          emit('save', { ...props.prompt, ...promptData })
        } else {
          emit('save', promptData)
        }
      }
    }

    return {
      form,
      markdownPreview,
      handleSubmit,
      uniqueCategories,
      selectCategory,
      showToast,
      toastMessage
    }
  }
})
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.markdown-preview {
  overflow-y: auto;
  max-height: 300px;
}

.dark-mode .modal-content {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

.dark-mode .modal-header {
  border-bottom-color: #333333;
}

.dark-mode .modal-footer {
  border-top-color: #333333;
}

.dark-mode .form-control {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #e0e0e0;
}

.dark-mode .form-control:focus {
  background-color: #2d2d2d;
  border-color: #4a4a4a;
  color: #e0e0e0;
}

.dark-mode .card {
  background-color: #2d2d2d;
  border-color: #404040;
}

.dark-mode .card-header {
  background-color: #333333;
  border-bottom-color: #404040;
  color: #e0e0e0;
}

.dark-mode .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.dark-mode input::placeholder,
.dark-mode textarea::placeholder {
  color: #fff !important;
  opacity: 1;
}

@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }

  .markdown-preview {
    max-height: 200px;
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style> 