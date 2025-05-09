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
  faSearch, 
  faEdit, 
  faTrash, 
  faCopy, 
  faEye, 
  faSortUp, 
  faSortDown,
  faFileExport,
  faFileImport,
  faSun,
  faMoon
} from '@fortawesome/free-solid-svg-icons'

// 註冊所有需要的圖標
library.add(
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faCopy,
  faEye,
  faSortUp,
  faSortDown,
  faFileExport,
  faFileImport,
  faSun,
  faMoon
)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())

app.mount('#app') 