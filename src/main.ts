import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createHead } from "@vueuse/head";
import FormInput from "./components/Forms/FormInput.vue";
import FormLabel from "./components/Forms/FormLabel.vue";
import PrimaryButton from "./components/Buttons/PrimaryButton.vue";
import SecondaryButton from "./components/Buttons/SecondaryButton.vue";

import "./assets/index.postcss";
import "./styles/font.css";

const head = createHead();
const app = createApp(App);

app.component("form-input", FormInput);
app.component("form-label", FormLabel);
app.component("primary-button", PrimaryButton);
app.component("secondary-button", SecondaryButton);

app.use(router);
app.use(head);

app.mount("#app");
