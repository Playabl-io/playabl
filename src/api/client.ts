import { supabase } from "@/supabase";
import axios from "axios";

const client = axios.create();
client.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    config.headers.Authorization = session.access_token;
  }
  return config;
});
export default client;
