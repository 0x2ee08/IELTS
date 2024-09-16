import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface CircularProgressWithCountdownProps {
  progress: number;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
}

const CircularProgressWithCountdown: React.FC<CircularProgressWithCountdownProps> = ({
  progress,
  size = 200,
  backgroundColor = '#006fee',
  foregroundColor = '#dcdcdc',
}) => {
  return (
    <div className='flex flex-col items-center'>
      <div className='font-bold text-xl mb-4'>
        Record starting in...
      </div>
      <div className='mt-4'>
        <Box sx={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
          {/* <CircularProgress
            variant="determinate"
            value={100}
            size={size}
            sx={{ color: backgroundColor, position: 'absolute', top: 0, left: 0, zIndex: 1 }}
          /> */}
          <CircularProgress
            variant="determinate"
            value={progress}
            size={size}
            sx={{
              color: backgroundColor,
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 2,
              clipPath: 'inset(0 0 0 0)',
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" component="div" color="black" sx={{ fontSize: '3rem' }}>
              {`${Math.round((100 - progress) / 10)}`}
            </Typography>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default CircularProgressWithCountdown;
