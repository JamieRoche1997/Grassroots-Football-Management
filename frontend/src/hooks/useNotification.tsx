import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "../services/firebaseConfig";
import { useSnackbar } from "notistack";

/**
 * Listens for foreground FCM messages and shows a simple toast.
 */
export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      unsubscribe = onMessage(messaging, (payload) => {
        try {
          const title = payload.notification?.title ?? "Notification";
          const body = payload.notification?.body ?? "";

          enqueueSnackbar(`${title}: ${body}`, {
            variant: "info",
            autoHideDuration: 6000,
          });
        } catch (error) {
          console.error("Error processing notification:", error);
          enqueueSnackbar("Unable to display notification", { variant: "error" });
        }
      });
    } catch (error) {
      console.error("Error setting up notification listener:", error);
    }

    return () => unsubscribe();
  }, [enqueueSnackbar]);
};
