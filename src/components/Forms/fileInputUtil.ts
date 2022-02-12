import useToast from "../Toast/useToast";

const { showError } = useToast();

export function handleFileDrop(
  event: DragEvent,
  sizeLimit = { value: 3000000, label: "3 MB" }
) {
  const dt = event.dataTransfer;
  const file = dt?.files[0];
  if (!file?.type.startsWith("image/")) {
    showError({ message: "Only image files are allowed" });
    return;
  }
  if (file.size > sizeLimit.value) {
    showError({
      message: `That file is too large. Only files under ${sizeLimit.label} are allowed`,
    });
    return;
  }
  return file;
}

export function handleFileChange(
  event: Event,
  sizeLimit = { value: 3000000, label: "3 MB" }
) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (file.size > sizeLimit.value) {
    showError({
      message: `That file is too large. Only files under ${sizeLimit.label} are allowed`,
    });
    return;
  }
  return file;
}
