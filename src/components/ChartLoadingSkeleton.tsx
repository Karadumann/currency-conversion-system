import React from 'react';
import { Skeleton, Paper, Grid } from '@mui/material';

const ChartLoadingSkeleton: React.FC = () => {
  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {/* Chart Area */}
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={400} />
        </Paper>
      </Grid>

      {/* Analysis Area */}
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
          {[...Array(4)].map((_, index) => (
            <React.Fragment key={index}>
              <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
            </React.Fragment>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ChartLoadingSkeleton; 