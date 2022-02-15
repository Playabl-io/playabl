import { v4 as uuidv4 } from "uuid";
import { ref } from "vue";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error";
  title?: string;
  timer: number;
}

const messages = ref<ToastMessage[]>([]);

const timers: Record<string, NodeJS.Timer> = {};

export default function useToast() {
  const showSuccess = ({
    message,
    title = "Success!",
  }: {
    message: string;
    title?: string;
  }) => {
    showToast({ message, title, type: "success" });
  };

  const showError = ({
    message,
    title = "That's not right",
  }: {
    message: string;
    title?: string;
  }) => {
    showToast({ message, title, type: "error" });
  };

  const showToast = (message: Omit<ToastMessage, "id" | "timer">) => {
    const id = uuidv4();
    messages.value.unshift({ id, ...message, timer: 5 });
    setTimer(id);
  };

  const clearMessage = (messageId: ToastMessage["id"]) => {
    clearInterval(timers[messageId]);
    const index = messages.value.findIndex(
      (message) => message.id === messageId
    );
    messages.value.splice(index, 1);
  };

  function pauseTimer(messageId: ToastMessage["id"]) {
    clearInterval(timers[messageId]);
  }

  function setTimer(messageId: ToastMessage["id"]) {
    timers[messageId] = setInterval(() => {
      const currentMessage = messages.value.find(
        (message) => message.id === messageId
      );
      if (!currentMessage) return;
      if (currentMessage.timer <= 0) {
        clearMessage(messageId);
        return;
      }
      currentMessage.timer--;
    }, 1000);
  }

  function resetMessageTime(messageId: ToastMessage["id"]) {
    const currentMessage = messages.value.find(
      (message) => message.id === messageId
    );
    if (!currentMessage) return;
    currentMessage.timer = 10;
  }

  function resetAndStartTimer(messageId: ToastMessage["id"]) {
    resetMessageTime(messageId);
    setTimer(messageId);
  }

  return {
    showSuccess,
    showError,
    messages,
    clearMessage,
    pauseTimer,
    resetAndStartTimer,
  };
}
