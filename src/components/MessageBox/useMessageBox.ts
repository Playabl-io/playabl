import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";

export const isOpen = ref(false);
export const toLine = ref("");

type onSendCallback = ({
  message,
  shareEmail,
  messageId,
}: {
  message: string;
  shareEmail: boolean;
  messageId: string;
}) => void;

export interface MessageBoxMessage {
  id: string;
  to: string;
  isSubmitting: boolean;
  onSend: onSendCallback;
}

const messages = ref<MessageBoxMessage[]>([]);

export default function useMessageBox() {
  function openMessageBox({
    to,
    onSend,
  }: {
    to: string;
    onSend: onSendCallback;
  }) {
    const id = uuidv4();
    messages.value.push({
      to,
      id,
      isSubmitting: false,
      onSend,
    });
  }

  function closeMessageBox(messageId: string) {
    messages.value = messages.value.filter(({ id }) => id !== messageId);
  }

  function setMessageIsSubmitting({
    messageId,
    isSubmitting,
  }: {
    messageId: string;
    isSubmitting: boolean;
  }) {
    messages.value = messages.value.map((message) => {
      if (message.id === messageId) {
        return { ...message, isSubmitting };
      }
      return message;
    });
  }

  return {
    openMessageBox,
    closeMessageBox,
    setMessageIsSubmitting,
    messages,
  };
}
