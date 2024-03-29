import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import React, { FC } from 'react';

import type { ConfigResponseEntry as EndpointConfig } from '../../server/types';

type OnOverrideChange = (value: string) => void;

type OverrideProps = {
  overrides: EndpointConfig['overrides'];
  onOverrideChange: OnOverrideChange;
  endpointId: string;
  isExpanded: boolean;
};

export const Overrides: FC<OverrideProps> = ({
  overrides,
  endpointId,
  isExpanded,
  onOverrideChange,
}) => {
  const [value, setValue] = React.useState(
    overrides.find(({ isActive }) => isActive)?.overrideId ?? 'none',
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
            {overrides.map(
              ({ overrideId }) => (
                <FormControlLabel
                  key={overrideId}
                  value={overrideId}
                  control={<Radio />}
                  data-testid={overrideId}
                  label={overrideId}
                />
              ),
            )}
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Collapse>
  );
};
