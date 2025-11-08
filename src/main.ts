import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// Importar solo el CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Importar el JS para que funcionen los togglers, modales, etc.
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// Importar Bootstrap Icons (opcional, pero recomendado si usas bi-*)
import "bootstrap-icons/font/bootstrap-icons.css";

const app = createApp(App);

// Usa el router que definimos
app.use(router);

// Monta la aplicación en el elemento DOM con id="app" (generalmente en index.html)
app.mount("#app");
