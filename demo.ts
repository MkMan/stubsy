import { Stubsy } from './dist';

const stubsy = new Stubsy();

stubsy.registerEndpoint('books', {
  path: '/books',
  status: 200,
  type: 'get',
  responseBody: [{ title: 'Divine reality' }, { title: 'The sealed nectar' }],
  delay: 2000,
});

stubsy.registerOverride('books', 'error', {
  status: 404,
  responseBody: { message: 'resource not found' },
  delay: 5000,
});
stubsy.registerOverride('books', 'outage', {
  status: 500,
  responseBody: { message: 'server outage' },
});

stubsy.activateOverride('books', 'error');

stubsy.registerEndpoint('magazines', {
  path: '/magazines',
  status: 200,
  type: 'get',
  responseBody: [{ title: 'Divine reality' }, { title: 'The sealed nectar' }],
});

stubsy.app.listen(3000, () => {
  console.log('The Stubsy UI can be accessed on http://localhost:3000/Stubsy');
});
