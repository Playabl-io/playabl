import { assign } from "xstate";
import useToast from "@/components/Toast/useToast";

/**
 * Drawer actions
 */
export const drawerActions = {
  showDrawer: assign({
    drawerVisible: () => true,
  }),
  hideDrawer: assign({
    drawerVisible: () => false,
  }),
};

/**
 * Toast actions
 */
const { showError, showSuccess } = useToast();
export const toastActions = {
  showError: (_: unknown, event: { data?: { message: string } }) => {
    showError({ message: event.data?.message || "Something went wrong" });
  },
  showSuccess: (_: unknown, event: { data?: { message: string } }) => {
    showSuccess({ message: event.data?.message || "Operation complete!" });
  },
};
export function makeSuccessAction(message: string) {
  return () => {
    showSuccess({ message });
  };
}
export function makeErrorAction(message: string) {
  return () => {
    showError({ message });
  };
}
