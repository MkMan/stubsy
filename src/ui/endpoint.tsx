import React, { FC } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

import type { ConfigResponseEntry as EndpointConfig } from '../server/types';

type OnOverrideChange = (value: string) => void;

type OverrideProps = {
  overrides: EndpointConfig['overrides'];
  onOverrideChange: OnOverrideChange;
  endpointId: string;
  isExpanded: boolean;
};

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
              onClick={handleExpandClick}
              aria-expanded={isExpanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          ) : null
        }
        title={`${type.toUpperCase()} ${path}`}
      />
      {hasOverrides && (
        <Overrides
          onOverrideChange={onOverrideChange}
          overrides={overrides}
          endpointId={endpointId}
          isExpanded={isExpanded}
        />
      )}
    </Card>
  );
};

const Overrides: FC<OverrideProps> = ({
  overrides,
  endpointId,
  isExpanded,
  onOverrideChange,
}) => {
  const [value, setValue] = React.useState(
    overrides.find(({ isActive }) => isActive)?.overrideId ?? 'none'
  );

  const handleOverrideChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedOverrideValue = event.target.value;
    setValue(selectedOverrideValue);
    onOverrideChange(selectedOverrideValue);
  };

  return (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <CardContent>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="endpoints overrides"
            name={endpointId}
            value={value}
            onChange={handleOverrideChange}
          >
            <FormControlLabel
              value="none"
              control={<Radio />}
              label="Default"
              data-testid="default"
            />
            {overrides.map(({ overrideId }) => (
              <FormControlLabel
                key={overrideId}
                value={overrideId}
                control={<Radio />}
                data-testid={overrideId}
                label={overrideId}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Collapse>
  );
};
