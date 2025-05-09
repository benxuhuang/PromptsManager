<template>
  <div class="table-responsive">
    <table class="table">
      <thead>
        <tr>
          <th class="col-title">標題</th>
          <th class="col-category">類別</th>
          <th class="col-action">操作</th>
          <th class="cursor-pointer column-updated-at col-updated-at" @click="$emit('toggle-sort')">
            更新時間
            <font-awesome-icon :icon="sortOrder === 'asc' ? 'sort-up' : 'sort-down'" class="ms-1" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prompt in prompts" :key="prompt.id">
          <td :class="['prompt-title']">{{ prompt.title }}</td>
          <td>
            <div class="d-flex flex-wrap gap-1">
              <span v-for="cat in prompt.category.split(',')" :key="cat" class="badge bg-primary">
                {{ cat.trim() }}
              </span>
            </div>
          </td>
          <td class="action-buttons">
            <!-- <button class="btn btn-sm btn-outline-success me-2" @click="copyContent(prompt.content)">
              <font-awesome-icon icon="copy" /> 複製
            </button> -->
            <button class="btn btn-sm btn-outline-secondary me-2" @click="previewContent(prompt.content)">
              <font-awesome-icon icon="eye" /> 預覽
            </button>
            <button class="btn btn-sm btn-outline-secondary me-2" @click="openTemplateModal(prompt.content)">
              <font-awesome-icon icon="pen-to-square" /> 填入模板
            </button>
            <button class="btn btn-sm btn-outline-secondary me-2" @click="$emit('edit', prompt)">
              <font-awesome-icon icon="edit" /> 編輯
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="$emit('delete', prompt.id)">
              <font-awesome-icon icon="trash" /> 刪除
            </button>
          </td>
          <td class="column-updated-at">{{ formatDate(prompt.updatedAt) }}</td>
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
          <div class="preview-content markdown-preview" v-html="markdownPreview(previewText)"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showPreview = false">
            關閉
          </button>
          <button type="button" class="btn btn-primary" @click="copyContent(previewText)">
            <font-awesome-icon icon="copy" /> 複製
          </button>
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

  <!-- 模板 Modal -->
  <TemplateModal
    v-if="showTemplateModal"
    :template="templateContent"
    @close="showTemplateModal = false"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import type { Prompt } from '../types/prompt'
import TemplateModal from './TemplateModal.vue'
import { marked } from 'marked'

export default defineComponent({
  name: 'PromptList',
  components: {
    TemplateModal
  },
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
    const showTemplateModal = ref(false)
    const templateContent = ref('')

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

    const markdownPreview = (content: string) => {
      return marked(content)
    }

    const openTemplateModal = (content: string) => {
      templateContent.value = content
      showTemplateModal.value = true
    }

    return {
      formatDate,
      copyContent,
      previewContent,
      showPreview,
      previewText,
      showToast,
      showTemplateModal,
      templateContent,
      openTemplateModal,
      markdownPreview
    }
  }
})
</script>

<style scoped>
.table {
  margin-bottom: 0;
}

/* 柔和灰黑色主題 */
.dark-mode .table {
  color: #e4e6eb;
  background-color: #23262b;
}
.dark-mode .table > :not(caption) > * > * {
  background-color: #23262b;
  border-color: #353941;
  color: #e4e6eb;
}
.dark-mode thead th {
  color: #f1f1f1;
  background-color: #23262b;
  border-bottom: 2px solid #353941;
}
.dark-mode .prompt-title {
  color: #e4e6eb !important;
}
.dark-mode .badge {
  background-color: #3b82f6 !important;
  color: #fff;
}

@media (max-width: 768px) {
  .table td {
    white-space: normal;
  }
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  .column-updated-at {
    display: none !important;
  }
  .prompt-title {
    max-width: 100px;
    font-size: 0.95rem;
  }
  .action-buttons {
    flex-direction: row;
    gap: 0.15rem;
  }
  .col-title, .col-category, .col-updated-at, .col-action {
    width: auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
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
  background-color: #23262b;
  color: #e4e6eb;
}

.toast {
  background-color: #28a745;
  color: white;
}

.dark-mode .modal-content {
  background-color: #23262b;
  color: #e4e6eb;
}

.dark-mode .modal-header {
  border-bottom-color: #353941;
}

.dark-mode .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.prompt-title {
  word-break: break-all;
  max-width: 330px;
}
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
.col-title {
  width: 160px;
  min-width: 120px;
  max-width: 220px;
  word-break: break-all;
}
.col-category {
  width: 110px;
  min-width: 80px;
  max-width: 160px;
  word-break: break-all;
}
.col-updated-at {
  width: 100px;
  min-width: 100px;
  max-width: 180px;
}
.col-action {
  width: 180px;
  min-width: 120px;
  max-width: 220px;
}
</style> 