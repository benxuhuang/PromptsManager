import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 引入 Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// 引入 Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSave,
  faSearch,
  faMoon,
  faSun,
  faTimes
} from '@fortawesome/free-solid-svg-icons'

// 註冊圖標
library.add(
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faSearch,
  faMoon,
  faSun,
  faTimes
)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())

app.mount('#app') 