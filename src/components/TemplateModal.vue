<template>
  <div class="modal d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">填入提示詞模板</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">請輸入要填入的內容</label>
            <textarea
              class="form-control"
              v-model="inputText"
              rows="5"
              placeholder="請輸入要填入的內容..."
            ></textarea>
          </div>
          <div class="mb-3 d-flex gap-2 flex-wrap">
            <button type="button" class="btn btn-outline-success btn-sm" @click="openExternal('chatgpt')">
              ChatGPT
            </button>
            <button type="button" class="btn btn-outline-success btn-sm" @click="openExternal('claude')">
              Claude
            </button>
            <button type="button" class="btn btn-outline-success btn-sm" @click="openExternal('felo')">
              Felo Search
            </button>
            <button type="button" class="btn btn-outline-success btn-sm" @click="openExternal('perplexity')">
              Perplexity
            </button>
          </div>
          <div class="preview-section">
            <h6>預覽：</h6>
            <pre class="preview-content">{{ previewText }}</pre>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="handleCopy">
            <font-awesome-icon icon="copy" /> 複製
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>

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
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'TemplateModal',
  props: {
    template: {
      type: String,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const inputText = ref('')
    const showToast = ref(false)

    const previewText = computed(() => {
      // if (!inputText.value) return ''
      
      if (props.template.includes('`text`')) {
        return props.template.replace(/`text`/g, inputText.value)
      } else {
        return `${props.template}\n\n${inputText.value}`
      }
    })

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(previewText.value)
        showToast.value = true
        setTimeout(() => {
          showToast.value = false
          emit('close')
        }, 1000)
      } catch (err) {
        console.error('複製失敗:', err)
      }
    }

    const openExternal = (type: string) => {
      let url = ''
      const encoded = encodeURIComponent(previewText.value)
      switch (type) {
        case 'chatgpt':
          url = `https://chatgpt.com/?model=gpt-4o-mini&q=${encoded}`
          break
        case 'felo':
          url = `https://felo.ai/search?q=${encoded}`
          break
        case 'perplexity':
          url = `https://www.perplexity.ai/search?q=${encoded}`
          break
        case 'claude':
          url = `https://claude.ai/new?q=${encoded}`
          break
      }
      if (url) window.open(url, '_blank')
    }

    return {
      inputText,
      previewText,
      showToast,
      handleCopy,
      openExternal
    }
  }
})
</script>

<style scoped>
.preview-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.preview-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
  max-height: 200px;
  overflow-y: auto;
}

.dark-mode .preview-content {
  background-color: #2d2d2d;
  color: #ffffff;
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
  background-color: #2d2d2d;
  border-color: #404040;
  color: #ffffff;
}

.dark-mode .form-control:focus {
  background-color: #2d2d2d;
  border-color: #4a4a4a;
  color: #ffffff;
}

.dark-mode .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.toast {
  background-color: #28a745;
  color: white;
}

.dark-mode input::placeholder,
.dark-mode textarea::placeholder {
  color: #fff !important;
  opacity: 1;
}
</style> 