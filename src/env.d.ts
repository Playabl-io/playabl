/// <reference types="vite/client" />

declare module "*.vue" {
  import { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<any, {}, any>;
  export default component;
}

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  // Only string type here to avoid hard to debug cast problems in your components!
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_BUILD_EPOCH?: string;
  readonly VITE_SLACK_CLIENT_ID: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SLACK_REDIRECT_URI: string;
  readonly VITE_PLAYABL_API: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
