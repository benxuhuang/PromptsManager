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
                required
              >
            </div>
            <div class="mb-3">
              <label class="form-label">內容</label>
              <div class="d-flex gap-3">
                <div class="flex-grow-1">
                  <textarea
                    class="form-control font-monospace"
                    v-model="form.content"
                    rows="10"
                    required
                  ></textarea>
                </div>
                <div class="flex-grow-1">
                  <div class="card h-100">
                    <div class="card-body markdown-preview">
                      <div v-html="markdownPreview"></div>
                    </div>
                  </div>
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
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import type { Prompt } from '../types/prompt'

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
    const form = ref({
      title: '',
      category: '',
      content: ''
    })

    const markdownPreview = computed(() => {
      return marked(form.value.content)
    })

    onMounted(() => {
      if (props.prompt) {
        form.value = {
          title: props.prompt.title,
          category: props.prompt.category,
          content: props.prompt.content
        }
      }
    })

    const handleSubmit = () => {
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
      handleSubmit
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
}

.dark-mode .modal-content {
  background-color: #2d2d2d;
  color: #ffffff;
}

.dark-mode .modal-header {
  border-bottom-color: #404040;
}

.dark-mode .modal-footer {
  border-top-color: #404040;
}

.dark-mode .form-control {
  background-color: #1a1a1a;
  border-color: #404040;
  color: #ffffff;
}

.dark-mode .card {
  background-color: #1a1a1a;
  border-color: #404040;
}

.dark-mode .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}
</style> 