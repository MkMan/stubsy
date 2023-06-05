import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import React, { FC } from 'react';

import type { ConfigResponseEntry as EndpointConfig } from '../../server/types';
import { Overrides } from './overrides';

type OnOverrideChange = (value: string) => void;

export const Endpoint: FC<{ endpointConfig: EndpointConfig }> = ({
  endpointConfig,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const { path, type, endpointId, overrides } = endpointConfig;
  const hasOverrides = overrides.length > 0;

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  const onOverrideChange: OnOverrideChange = (overrideId) => {
    fetch('/Stubsy/Config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpointId,
        overrideId,
      }),
    });
  };

  return (
    <Card style={{ marginBottom: '20px' }}>
      <CardHeader
        action={
          hasOverrides ? (
            <IconButton
              aria-expanded={isExpanded}
              aria-label="show more"
              onClick={handleExpandClick}
            >
              <ExpandMoreIcon />
            </IconButton>
          ) : null
        }
        title={`${type.toUpperCase()} ${path}`}
      />
      {hasOverrides && (
        <Overrides
          endpointId={endpointId}
          isExpanded={isExpanded}
          onOverrideChange={onOverrideChange}
          overrides={overrides}
        />
      )}
    </Card>
  );
};
