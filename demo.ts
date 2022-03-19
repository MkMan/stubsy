import {
  createServer,
  registerEndpoint,
  registerOverride,
  activateOverride,
} from './dist';

const app = createServer();

registerEndpoint(app, {
  endpointId: 'movies',
  path: '/movies',
  status: 200,
  type: 'get',
  responseBody: [{ title: 'Inception' }, { title: 'Tenet' }],
});

registerOverride('movies', {
  overrideId: '404',
  status: 404,
  responseBody: { message: 'resource not found' },
});
registerOverride('movies', {
  overrideId: '500',
  status: 500,
  responseBody: { message: 'server outage' },
});

activateOverride('movies', '500');

registerEndpoint(app, {
  endpointId: 'books',
  path: '/books',
  status: 200,
  type: 'get',
  responseBody: [{ title: 'Divine reality' }, { title: 'The Sealed Nectar' }],
});

app.listen(3000, () => {
  console.log('The Stubsy UI can be accessed on http://localhost:3000/Stubsy');
});
