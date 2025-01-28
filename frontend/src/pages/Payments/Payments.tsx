import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Card } from '@mui/material';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Layout from '../../components/Layout'; 
import AddressForm from './components/AddressForm';
import PaymentForm from './components/PaymentForm';
import Review from './components/Review';
import Info from './components/Info';

const steps = ['Shipping address', 'Payment details', 'Review your order'];

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return <AddressForm />;
    case 1:
      return <PaymentForm />;
    case 2:
      return <Review />;
    default:
      throw new Error('Unknown step');
  }
}

export default function PaymentsPage() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mx: 3,
          pb: 5,
          pt: 10,
        }}
      >
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ width: '100%', maxWidth: 600 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Current Step Content */}
        <Box sx={{ width: '100%', maxWidth: 600, mt: 4 }}>
          {activeStep === steps.length ? (
            <Stack spacing={2} alignItems="center">
              <Typography variant="h1">📦</Typography>
              <Typography variant="h5">Thank you for your order!</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Your order number is <strong>#140396</strong>. We have emailed your order
                confirmation and will update you once it has shipped.
              </Typography>
              <Button variant="contained">Go to my orders</Button>
            </Stack>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: activeStep === 0 ? 'flex-end' : 'space-between',
                  mt: 4,
                }}
              >
                {activeStep !== 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<ChevronLeftRoundedIcon />}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="contained"
                  endIcon={<ChevronRightRoundedIcon />}
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Box>
      </Box>

      {/* Info Panel */}
      <Card
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '25%',
          backgroundColor: 'background.paper',
          boxShadow: 1,
          padding: 4,
          mt: 4,
        }}
      >
        <Typography variant="h6">Order Summary</Typography>
        <Info totalPrice={activeStep >= 2 ? '$144.97' : '$134.98'} />
      </Card>
    </Layout>
  );
}
