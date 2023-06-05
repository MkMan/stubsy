import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import React, { FC, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ConfigResponseEntry } from '../server/types';
import { Endpoints } from './components/endpoints';

const Logo: FC = () => (
  <Typography align="center" component="h1" gutterBottom variant="h1">
    Stubsy
  </Typography>
);

const App: FC = () => {
  const [serverConfig, setServerConfig] = useState<ConfigResponseEntry[]>([]);

  useEffect(() => {
    const fetchServerConfig = async () => {
      const response = await (await fetch('/Stubsy/Config')).json();

      setServerConfig(response);
    };
    fetchServerConfig();
  }, []);
  return (
    <Container maxWidth="md">
      <Logo />
      <Endpoints serverConfig={serverConfig} />
    </Container>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('app-root')!)
  .render(<App />);
