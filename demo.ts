import { Stubsy } from './dist';

const stubPage = new Stubsy(3000);

stubPage.registerEndpoint('books', {
  path: '/books',
  status: 200,
  type: 'get',
  responseBody: [{ title: 'Divine reality' }, { title: 'The sealed nectar' }],
});

stubPage.registerOverride('books', 'error', { status: 404, responseBody: {} });
stubPage.registerOverride('books', 'outage', { status: 500, responseBody: {} });

stubPage.registerEndpoint('magazines', {
  path: '/magazines',
  status: 200,
  type: 'get',
  responseBody: [{ title: 'Divine reality' }, { title: 'The sealed nectar' }],
});

stubPage.start();
