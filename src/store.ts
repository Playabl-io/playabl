import { reactive } from "vue";

interface StoreUser {
  user: { id: string; email?: string; pronouns?: string } | null;
}
export const store = reactive<StoreUser>({
  user: null,
});
