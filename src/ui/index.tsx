import React, { FC } from 'react';
import ReactDom from 'react-dom';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
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
