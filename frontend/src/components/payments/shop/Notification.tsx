import { Snackbar } from '@mui/material';

interface NotificationProps {
    notification: string | null;
    setNotification: (msg: string | null) => void;
}

export default function Notification({ notification, setNotification }: NotificationProps) {
    return (
        <Snackbar open={!!notification} autoHideDuration={2000} onClose={() => setNotification(null)} message={notification} />
    );
}
