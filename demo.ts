import { Stubsy } from './dist';

const stubsy = new Stubsy(3000);

stubsy.registerEndpoint('books', {
  path: '/books',
  status: 200,
  type: 'get',
  responseBody: [{ title: 'Divine reality' }, { title: 'The sealed nectar' }],
});

stubsy.registerOverride('books', 'error', { status: 404, responseBody: {} });
stubsy.registerOverride('books', 'outage', { status: 500, responseBody: {} });

stubsy.registerEndpoint('magazines', {
  path: '/magazines',
  status: 200,
  type: 'get',
  responseBody: [{ title: 'Divine reality' }, { title: 'The sealed nectar' }],
});

stubsy.start();
