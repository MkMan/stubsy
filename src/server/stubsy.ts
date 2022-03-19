import express from 'express';
import type { Express } from 'express';
import { json } from 'body-parser';
import path from 'path';

import {
  assert,
  generateEndpointCallback,
  generateUiConfigResponse,
} from './utility';
import type {
  ConfigPayload,
  Endpoint,
  EndpointId,
  Override,
  OverrideId,
} from './types';
import { StubsyState } from './state';

export const createServer = (app: Express = express()): Express => {
  app.use(json());
  app.use('/Stubsy', express.static(path.resolve(__dirname, './ui/')));

  app.post('/Stubsy/Config', (req, res, next) => {
    const { endpointId, overrideId }: ConfigPayload = req.body;

    activateOverride(endpointId, overrideId);
    res.send({ status: 'OK' });
  });

  app.get('/Stubsy/Config', (req, res, next) => {
    res.send(generateUiConfigResponse());
  });

  return app;
};

export const activateOverride = (
  endpointId: EndpointId,
  overrideId: OverrideId = 'none'
): void => {
  StubsyState.getInstance().setActiveOverride(endpointId, overrideId);
};

export const registerEndpoint = (app: Express, endpoint: Endpoint): void => {
  const state = StubsyState.getInstance();
  const { endpointId, ...endpointBehaviour } = endpoint;

  assert(
    !state.endpointExists(endpointId),
    `Endpoint with id ${endpointId} has already been defined`
  );

  const { type, path } = endpointBehaviour;

  state.addEndpoint(endpointId, endpointBehaviour);
  app[type](path, generateEndpointCallback(endpoint));
};

export const registerOverride = (
  endpointId: EndpointId,
  override: Override
): void => {
  const state = StubsyState.getInstance();
  const { overrideId, ...overrideBehaviour } = override;

  assert(
    state.endpointExists(endpointId),
    `Endpoint with id${endpointId} has not been defined`
  );

  assert(
    !state.overrideExists(endpointId, overrideId),
    `An override with id ${overrideId} has already been set for endpoint ${endpointId}`
  );

  state.addOverride(endpointId, overrideId, overrideBehaviour);
};
