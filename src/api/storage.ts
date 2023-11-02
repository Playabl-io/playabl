import { supabase } from "@/supabase";
import { store } from "@/store";
import { log } from "@/util/logger";

export async function removeObjects({
  bucket,
  paths,
}: {
  bucket: string;
  paths: string[];
}) {
  const { data, error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    log(error);
    throw error;
  }
  if (data) return data;
}

export async function uploadToCoverImageStorage({
  id,
  file,
}: {
  id: string;
  file: File;
}) {
  if (!store.user?.id) {
    throw new Error("no user!");
  }
  const { data, error } = await supabase.storage
    .from("cover-images")
    .upload(`${id}/${file.name}`, file, {
      cacheControl: "360000",
    });
  if (error) {
    if (error.message === "The resource already exists") {
      return `${id}/${file.name}`;
    }
    log({ error });
    throw error;
  }
  if (data) {
    return data.path.replace("cover-images/", "");
  }
}

export const getCoverImageUrl = async (path: string) => {
  const { data } = await supabase.storage
    .from("cover-images")
    .getPublicUrl(path, {
      transform: {
        height: 600,
        width: 1066,
      },
    });
  return data.publicUrl ?? "";
};

export async function uploadToAvatarStorage(file: File) {
  if (!store.user?.id) {
    throw new Error("no user!");
  }
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(`${store.user.id}/${file.name}`, file, {
      cacheControl: "360000",
    });
  if (error) {
    log({ error });
    throw error;
  }
  if (data) {
    return data.path.replace("avatars/", "");
  }
}

export const getAvatarImageUrl = async (path?: string) => {
  if (!path) return "";
  const { data } = await supabase.storage.from("avatars").getPublicUrl(path, {
    transform: {
      height: 100,
      width: 100,
    },
  });
  return data.publicUrl ?? "";
};
