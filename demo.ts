import {
  createServer,
  registerEndpoint,
  registerOverride,
  activateOverride,
} from './dist';

const app = createServer();

registerEndpoint(app, {
  endpointId: 'books',
  path: '/books',
  status: 200,
  type: 'get',
  responseBody: [{ title: 'Divine reality' }, { title: 'The sealed nectar' }],
});

registerOverride('books', {
  overrideId: 'error',
  status: 404,
  responseBody: { message: 'resource not found' },
});
registerOverride('books', {
  overrideId: 'outage',
  status: 500,
  responseBody: { message: 'server outage' },
});

activateOverride('books', 'error');

registerEndpoint(app, {
  endpointId: 'magazines',
  path: '/magazines',
  status: 200,
  type: 'get',
  responseBody: [{ title: 'Divine reality' }, { title: 'The sealed nectar' }],
});

app.listen(3000, () => {
  console.log('The Stubsy UI can be accessed on http://localhost:3000/Stubsy');
});
