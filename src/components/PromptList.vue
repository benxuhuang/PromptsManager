<template>
  <div class="table-responsive">
    <table class="table">
      <thead>
        <tr>
          <th>標題</th>
          <th>類別</th>
          <th>更新時間</th>
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Prompt } from '../types/prompt'

export default defineComponent({
  name: 'PromptList',
  props: {
    prompts: {
      type: Array as () => Prompt[],
      required: true
    }
  },
  emits: ['edit', 'delete'],
  setup() {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('zh-TW')
    }

    const copyContent = async (content: string) => {
      try {
        await navigator.clipboard.writeText(content)
        alert('已複製到剪貼簿')
      } catch (err) {
        console.error('複製失敗:', err)
        alert('複製失敗')
      }
    }

    return {
      formatDate,
      copyContent
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
</style> 