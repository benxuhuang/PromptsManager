<template>
  <div class="table-responsive">
    <table class="table">
      <thead>
        <tr>
          <th>標題</th>
          <th>類別</th>
          <th class="cursor-pointer" @click="$emit('toggle-sort')">
            更新時間
            <font-awesome-icon :icon="sortOrder === 'asc' ? 'sort-up' : 'sort-down'" class="ms-1" />
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prompt in prompts" :key="prompt.id">
          <td>{{ prompt.title }}</td>
          <td>
            <div class="d-flex flex-wrap gap-1">
              <span v-for="cat in prompt.category.split(',')" :key="cat" class="badge bg-primary">
                {{ cat.trim() }}
              </span>
            </div>
          </td>
          <td>{{ formatDate(prompt.updatedAt) }}</td>
          <td>
            <button class="btn btn-sm btn-outline-success me-2" @click="copyContent(prompt.content)">
              <font-awesome-icon icon="copy" /> 複製
            </button>
            <button class="btn btn-sm btn-outline-success me-2" @click="previewContent(prompt.content)">
              <font-awesome-icon icon="eye" /> 預覽
            </button>
            <button class="btn btn-sm btn-outline-primary me-2" @click="$emit('edit', prompt)">
              <font-awesome-icon icon="edit" /> 編輯
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', prompt.id)">
              <font-awesome-icon icon="trash" /> 刪除
            </button>
          </td>
        </tr>
        <tr v-if="prompts.length === 0">
          <td colspan="4" class="text-center">
            暫無提示詞，請點擊「新增提示詞」按鈕創建。
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 預覽 Modal -->
  <div class="modal fade" :class="{ show: showPreview }" tabindex="-1" style="display: block;" v-if="showPreview">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">提示詞預覽</h5>
          <button type="button" class="btn-close" @click="showPreview = false"></button>
        </div>
        <div class="modal-body">
          <pre class="preview-content">{{ previewText }}</pre>
        </div>
      </div>
    </div>
  </div>

  <!-- 複製成功提示 -->
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div class="toast" :class="{ show: showToast }" role="alert">
      <div class="toast-body">
        已複製到剪貼簿
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import type { Prompt } from '../types/prompt'

export default defineComponent({
  name: 'PromptList',
  props: {
    prompts: {
      type: Array as () => Prompt[],
      required: true
    },
    sortOrder: {
      type: String as () => 'asc' | 'desc',
      required: true
    }
  },
  emits: ['edit', 'delete', 'toggle-sort'],
  setup() {
    const showPreview = ref(false)
    const previewText = ref('')
    const showToast = ref(false)

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('zh-TW')
    }

    const copyContent = async (content: string) => {
      try {
        await navigator.clipboard.writeText(content)
        showToast.value = true
        setTimeout(() => {
          showToast.value = false
        }, 2000)
      } catch (err) {
        console.error('複製失敗:', err)
      }
    }

    const previewContent = (content: string) => {
      previewText.value = content
      showPreview.value = true
    }

    return {
      formatDate,
      copyContent,
      previewContent,
      showPreview,
      previewText,
      showToast
    }
  }
})
</script>

<style scoped>
.table {
  margin-bottom: 0;
}

.dark-mode .table {
  color: #e0e0e0;
}

.dark-mode .table > :not(caption) > * > * {
  background-color: #1a1a1a;
  border-color: #333333;
}

.dark-mode .badge {
  background-color: #2c5282 !important;
}

@media (max-width: 768px) {
  .table td {
    white-space: normal;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.preview-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 70vh;
  overflow-y: auto;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.dark-mode .preview-content {
  background-color: #2d2d2d;
  color: #ffffff;
}

.toast {
  background-color: #28a745;
  color: white;
}

.dark-mode .modal-content {
  background-color: #2d2d2d;
  color: #ffffff;
}

.dark-mode .modal-header {
  border-bottom-color: #404040;
}

.dark-mode .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}
</style> 