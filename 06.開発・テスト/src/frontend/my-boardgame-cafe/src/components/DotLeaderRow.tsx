import React from 'react';
import { Typography, Box } from '@mui/material';

interface DotLeaderRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  dotCount?: number;
  variant?: 'body1' | 'body2' | 'h6' | string;
  labelStyle?: React.CSSProperties;
  valueStyle?: React.CSSProperties;
}

const DotLeaderRow: React.FC<DotLeaderRowProps> = ({
  label,
  value,
  dotCount = 30,
  variant = 'body1',
  labelStyle = {},
  valueStyle = {},
}) => {
  return (
    <Typography
      variant={variant as any}
      component="div"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <span
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flexShrink: 0,
          marginRight: '8px',
          fontWeight: 'bold',
          maxWidth: '70%',
          ...labelStyle,
        }}
      >
        {label}
      </span>
      <Box
        component="span"
        sx={{
          display: 'flex',
          flexGrow: 1,
          justifyContent: 'flex-end',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'clip',
            whiteSpace: 'nowrap',
            flexGrow: 1,
            flexShrink: 2,
          }}
        >
          {'⋯'.repeat(dotCount)}
        </span>
        <span
          style={{
            whiteSpace: 'nowrap',
            flexShrink: 0,
            marginLeft: '8px',
            fontWeight: 'bold',
            minWidth: 'fit-content',
            ...valueStyle,
          }}
        >
          {value}
        </span>
      </Box>
    </Typography>
  );
};

export default DotLeaderRow;
