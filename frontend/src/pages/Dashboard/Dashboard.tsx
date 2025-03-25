import Stack from '@mui/material/Stack';
import Header from '../../components/Header';
import Layout from '../../components/Layout';
import MainGrid from './components/MainGrid';
import { auth } from '../../services/firebaseConfig';

export default function Dashboard() {
  const user = auth.currentUser;
  console.log('User:', user);
  return (
    <Layout>
      <Stack
        spacing={2}
        sx={{
          alignItems: 'center',
          pb: 5,
          mt: { xs: 8, md: 0 },
        }}
      >
        <Header />
        <MainGrid />
      </Stack>
    </Layout>
  );
}
