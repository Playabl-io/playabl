import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createHead } from "@vueuse/head";
import FormInput from "./components/Forms/FormInput.vue";
import FormLabel from "./components/Forms/FormLabel.vue";
import PrimaryButton from "./components/Buttons/PrimaryButton.vue";
import SecondaryButton from "./components/Buttons/SecondaryButton.vue";
import { register } from "swiper/element/bundle";
import "./serviceWorkerRegistration";
import "./assets/index.postcss";
import "./styles/font.css";
import "./styles/main.css";
import "./newRelicAgent";

const head = createHead();
const app = createApp(App);

register();

app.component("FormInput", FormInput);
app.component("FormLabel", FormLabel);
app.component("PrimaryButton", PrimaryButton);
app.component("SecondaryButton", SecondaryButton);

app.use(router);
app.use(head);

app.mount("#app");
