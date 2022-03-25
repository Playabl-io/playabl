export interface FileObject {
  id: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
  };
  name: string;
  updated_at: string;
}
