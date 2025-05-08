<template>
  <div class="table-responsive">
    <table class="table">
      <thead>
        <tr>
          <th>標題</th>
          <th>類別</th>
          <th>更新時間</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prompt in prompts" :key="prompt.id">
          <td>{{ prompt.title }}</td>
          <td>{{ prompt.category }}</td>
          <td>{{ formatDate(prompt.updatedAt) }}</td>
          <td>
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

    return {
      formatDate
    }
  }
})
</script>

<style scoped>
.table {
  margin-bottom: 0;
}

.dark-mode .table {
  color: #ffffff;
}

.dark-mode .table > :not(caption) > * > * {
  background-color: #2d2d2d;
  border-color: #404040;
}
</style> 