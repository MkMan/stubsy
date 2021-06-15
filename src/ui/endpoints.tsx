import React, { FC, useEffect, useState } from 'react';
import { Endpoint } from './endpoint';
import type { ConfigResponseEntry } from '../server/types';

export const Endpoints: FC = () => {
  const [serverConfig, setServerConfig] = useState<ConfigResponseEntry[]>([]);

  useEffect(() => {
    const fetchServerConfig = async () => {
      const response = await (await fetch('/Stubsy/Config')).json();

      setServerConfig(response);
    };
    fetchServerConfig();
  }, []);

  return (
    <>
      {serverConfig.map((endpointConfig) => (
        <Endpoint
          key={endpointConfig.endpointId}
          endpointConfig={endpointConfig}
        />
      ))}
    </>
  );
};
