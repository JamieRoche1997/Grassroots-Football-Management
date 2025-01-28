import Stack from '@mui/material/Stack';
import Header from '../../components/Header';
import MainGrid from './components/MainGrid';
import Layout from '../../components/Layout'; 

export default function Feedback() {
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
