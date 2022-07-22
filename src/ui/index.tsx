import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import React, { FC } from 'react';
import { createRoot } from 'react-dom/client';

import { Endpoints } from './endpoints';

const Logo: FC = () => (
  <Typography variant="h1" component="h1" align="center" gutterBottom>
    Stubsy
  </Typography>
);

const App: FC = () => (
  <Container maxWidth="md">
    <Logo />
    <Endpoints />
  </Container>
);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('app-root')!).render(<App />);
