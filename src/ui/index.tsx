import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import React, { FC } from 'react';
import ReactDom from 'react-dom';

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

ReactDom.render(<App />, document.getElementById('app-root'));
