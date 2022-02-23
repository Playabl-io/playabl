import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createHead } from "@vueuse/head";
import FormInput from "./components/Forms/FormInput.vue";
import FormLabel from "./components/Forms/FormLabel.vue";
import PrimaryButton from "./components/Buttons/PrimaryButton.vue";
import SecondaryButton from "./components/Buttons/SecondaryButton.vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "@vueup/vue-quill/dist/vue-quill.bubble.css";
import "./serviceWorkerRegistration";
import "./assets/index.postcss";
import "./styles/font.css";
import "./styles/main.css";

const head = createHead();
const app = createApp(App);

app.component("FormInput", FormInput);
app.component("FormLabel", FormLabel);
app.component("PrimaryButton", PrimaryButton);
app.component("SecondaryButton", SecondaryButton);
app.component("QuillEditor", QuillEditor);

app.use(router);
app.use(head);

app.mount("#app");
