import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit';
  text?: string;
  fullScreen?: boolean;
}

const mapSize = (size: LoadingSpinnerProps['size']) => {
  switch (size) {
    case 'small':
      return 20;
    case 'large':
      return 48;
    default:
      return 32;
  }
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', color = 'primary', text, fullScreen = false }) => {
  const spinner = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <CircularProgress size={mapSize(size)} color={color as any} />
      {text && <Typography variant="body2" color="text.secondary">{text}</Typography>}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box sx={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', zIndex: 1300 }}>
        {spinner}
      </Box>
    );
  }

  return spinner;
};

export default LoadingSpinner;