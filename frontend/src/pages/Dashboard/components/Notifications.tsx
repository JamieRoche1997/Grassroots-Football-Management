import { List, ListItem, ListItemText, Card, CardContent, Typography } from '@mui/material';

export default function Notifications() {
  const notifications = [
    'Player join request: Alex Johnson',
    'New message from John Smith',
    'Training session rescheduled',
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="div">
          Notifications
        </Typography>
        <List>
          {notifications.map((notification, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={notification} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
