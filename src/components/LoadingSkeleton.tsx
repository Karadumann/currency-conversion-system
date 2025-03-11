import React from 'react';
import { Skeleton, Paper, Grid } from '@mui/material';

const LoadingSkeleton: React.FC = () => {
  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Skeleton variant="text" width="40%" height={40} />
        </Grid>

        {/* Amount Input */}
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>

        {/* From Currency */}
        <Grid item xs={12} md={3}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>

        {/* Swap Button */}
        <Grid item xs={12} md={1}>
          <Skeleton variant="circular" width={40} height={40} />
        </Grid>

        {/* To Currency */}
        <Grid item xs={12} md={3}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>

        {/* Convert Button */}
        <Grid item xs={12} md={1}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>

        {/* Result */}
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={80} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LoadingSkeleton; 