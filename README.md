# Stubsy

Stubsy is a Node server built using Express. Its main goal is to allow
developers to easily set up a mock backend server and change its
behaviour after launch. This can be useful to test how the UI behaves
with different responses from the backend.

Stubsy ships with a UI to show the set up of the server and allow
changing endpoint's behaviour.

![animated demo of Stubsy](./docs/stubsy.gif)

## Installation

```text
npm install --save-dev stubsy
```

## Usage

### Definitions

#### Endpoint

An `Endpoint` is a REST endpoint that is set up with a default behaviour.
Its TypeScript definition is:

```ts
type EndpointBehaviour = {
  endpointId: string;
  path: string; // the route at which the endpoint is accessed
  responseBody: unknown;
  status: number;
  type: 'get' | 'post' | 'put' | 'delete' | 'patch';
};
```

**Note**: the `path` field can be any valid
[Express path](http://expressjs.com/en/guide/routing.html#route-paths).

#### Override

An `Override` is an overriding behaviour for an Endpoint to alter its
response. Its TypeScript definition is:

```ts
type OverrideBehaviour = {
  overrideId: string;
  responseBody: unknown;
  status: number;
};
```

### API

#### `createServer(expressApp): Express`

Sets up Stubsy's routes and creates an Express app if one is not provided.

- `expressApp` \<Express\>: an existing Express App for Stubsy to use

**Returns** the expressApp argument (if provided) or the created Express app.

#### `registerEndpoint(app, endpoint)`

Registers endpoints to be accessed on the server.

- `app` \<Express\> **required**: the return of `createServer`
- `endpoint` \<Endpoint\> **required**: the endpoint's definition

#### `registerOverride(endpointId, override)`

Registers override behaviour for a previously defined endpoint.

- `endpointId` \<String\> **required**: the id of the endpoint to register
an override for
- `override` \<Override\> **required**: the override's definition

#### `activateOverride(endpointId, overrideId)`

Activates the specified override on the endpoint.

- `endpointId` \<String\> **required**: the id of the endpoint to activate
the override on
- `overrideId` \<String\>: the id of the override to activate. If omitted
restores the override to the default behaviour.

### Example

```js
// server.js
import { 
  createServer,
  registerEndpoint,
  registerOverride,
  activateOverride
} from 'stubsy';

const stubsy = new createServer();

registerEndpoint(stubsy, {
  endpointId: 'films',
  path: '/films',
  status: 200,
  type: 'get',
  responseBody: [{ title: 'Inception' }, { title: 'Tenet' }],
});

registerOverride('films',{
    overrideId: 'error',
    status: 404,
    responseBody: {}
});
registerOverride('films',{
    overrideId: 'outage',
    status: 500,
    responseBody: {}
});

activateOverride('films', 'outage');

stubsy.listen(stubsyPortNumber);
```
