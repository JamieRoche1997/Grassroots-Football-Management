import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { alpha } from '@mui/material/styles';
import AppNavbar from './AppNavbar'; 
import SideMenu from './SideMenu'; 
import AppTheme from './shared-theme/AppTheme'; 
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../components/theme/customizations'; 
import Chatbot from './Chatbot';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

interface LayoutProps {
  children: React.ReactNode; 
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Side Menu */}
        <SideMenu />

        {/* Main Content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <AppNavbar />
          <Box
            sx={{
              px: 3,
              py: 2,
            }}
          >
            {children}
          </Box>
        </Box>
        <Chatbot />
      </Box>
    </AppTheme>
  );
}
