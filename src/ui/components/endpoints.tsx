import React, { FC } from 'react';

import type { ConfigResponseEntry } from '../../server/types';
import { Endpoint } from './endpoint';

export const Endpoints: FC<{ serverConfig: ConfigResponseEntry[] }> = ({
  serverConfig,
}) => (
  <>
  {serverConfig.map(
    (endpointConfig) => (
      <Endpoint
        key={endpointConfig.endpointId}
        endpointConfig={endpointConfig}
      />
    ),
  )}
  </>
);
