import useToast from "../Toast/useToast";

const { showError } = useToast();

export function handleFileDrop(event: DragEvent) {
  const dt = event.dataTransfer;
  const file = dt?.files[0];
  if (!file?.type.startsWith("image/")) {
    showError({ message: "Only image files are allowed" });
    return;
  }
  if (file.size > 3000000) {
    showError({
      message: "That file is too large. Only files under 3 MB are allowed",
    });
    return;
  }
  return file;
}

export function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (file.size > 3000000) {
    showError({
      message: "That file is too large. Only files under 3 MB are allowed",
    });
  }
  return file;
}
