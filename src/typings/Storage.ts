import { FileObject } from "@supabase/storage-js";
export interface EnhancedFileObject extends FileObject {
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
  };
}
