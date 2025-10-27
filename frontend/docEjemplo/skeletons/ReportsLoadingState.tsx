import React from 'react';
import { Box, Grid, Skeleton, Stack } from '@mui/material';
import PageLayout from '../PageLayout';
import PageSection from '../PageSection';
import SkeletonCard from '../../SkeletonCard';

interface ReportsLoadingStateProps {
  title: string;
  description?: string;
  overline?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

const ReportsLoadingState: React.FC<ReportsLoadingStateProps> = ({ title, description, overline, breadcrumbs }) => {
  return (
    <PageLayout
      title={title}
      description={description}
      overline={overline}
      breadcrumbs={breadcrumbs}
      secondaryActions={(
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
          <Skeleton variant="rounded" width={140} height={44} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={140} height={44} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={150} height={44} sx={{ borderRadius: 2 }} />
        </Stack>
      )}
      actions={<Skeleton variant="rounded" width={180} height={48} sx={{ borderRadius: 2 }} />}
    >
      <Stack spacing={4}>
        {/* Resumen: Ventas Totales, Órdenes Completadas, Distribución por Estado */}
        <Grid container spacing={3}>
          {(['success', 'primary', 'info'] as const).map((color, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <SkeletonCard variant="stat" color={color} />
            </Grid>
          ))}
        </Grid>

        <Box>
          <Skeleton variant="text" width="55%" height={20} sx={{ mb: 1 }} />
          <PageSection variant="surface" paperSx={{ borderRadius: 3 }}>
            <Stack spacing={2.5}>
              <Skeleton variant="text" width={200} height={26} />
              <SkeletonCard variant="chart" height={340} />
            </Stack>
          </PageSection>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <PageSection variant="surface" paperSx={{ borderRadius: 3 }}>
              <Stack spacing={2.5}>
                <Skeleton variant="text" width={220} height={28} />
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 0.6fr 0.8fr',
                      gap: 20,
                      px: 3,
                      py: 2,
                    }}
                  >
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} variant="text" height={18} sx={{ borderRadius: 1 }} />
                    ))}
                  </Box>
                  <Stack spacing={1} px={3} pb={2}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1.6fr 0.6fr 0.8fr',
                          gap: 20,
                          alignItems: 'center',
                          py: 1,
                        }}
                      >
                        <Skeleton variant="text" width={180} height={18} />
                        <Skeleton variant="text" width={80} height={18} sx={{ ml: 'auto' }} />
                        <Skeleton variant="text" width={100} height={18} sx={{ ml: 'auto' }} />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </PageSection>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <PageSection variant="surface" paperSx={{ borderRadius: 3 }}>
              <Stack spacing={2.5}>
                <Skeleton variant="text" width={220} height={28} />
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1.4fr 0.6fr 0.8fr',
                      gap: 20,
                      px: 3,
                      py: 2,
                    }}
                  >
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} variant="text" height={18} sx={{ borderRadius: 1 }} />
                    ))}
                  </Box>
                  <Stack spacing={1} px={3} pb={2}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1.4fr 0.6fr 0.8fr',
                          gap: 20,
                          alignItems: 'center',
                          py: 1,
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Skeleton variant="text" width={160} height={18} />
                          <Skeleton variant="text" width={120} height={14} />
                        </Stack>
                        <Skeleton variant="text" width={70} height={18} sx={{ ml: 'auto' }} />
                        <Skeleton variant="text" width={100} height={18} sx={{ ml: 'auto' }} />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </PageSection>
          </Grid>
        </Grid>
      </Stack>
    </PageLayout>
  );
};

export default ReportsLoadingState;
