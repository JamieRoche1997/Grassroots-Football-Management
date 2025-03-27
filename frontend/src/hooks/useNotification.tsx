import { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from '../services/firebaseConfig';
import { useSnackbar } from 'notistack';

/**
 * Listens for foreground FCM messages and shows a simple toast.
 */
export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? 'Notification';
      const body = payload.notification?.body ?? '';

      enqueueSnackbar(`${title}: ${body}`, {
        variant: 'info',
        autoHideDuration: 6000,
      });
    });

    return () => unsubscribe();
  }, [enqueueSnackbar]);
};
