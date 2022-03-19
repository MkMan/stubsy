import { RequestHandler } from 'express';
import { StubsyState } from '../state/state';
import type { ConfigResponseEntry, Endpoint } from '../types';

export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export const generateUiConfigResponse = (): ConfigResponseEntry[] => {
  const {
    endpoints,
    overrides: appOverrides,
    activeOverrides,
  } = StubsyState.getInstance();
  const response: ConfigResponseEntry[] = [];

  endpoints.forEach(({ path, type }, endpointId) => {
    const overridesForEndpoint = appOverrides.get(endpointId);

    if (!overridesForEndpoint) {
      response.push({ endpointId, path, type, overrides: [] });
      return;
    }

    const overrides: ConfigResponseEntry['overrides'] = [];
    overridesForEndpoint.forEach((_overrideBehaviour, overrideId) => {
      overrides.push({
        overrideId,
        isActive: activeOverrides.get(endpointId) === overrideId,
      });
    });
    response.push({ endpointId, path, type, overrides });
  });

  return response;
};

export const generateEndpointCallback = (
  endpoint: Endpoint
): RequestHandler => {
  const state = StubsyState.getInstance();
  const {
    endpointId,
    status: defaultStatus,
    responseBody: defaultResponseBody,
  } = endpoint;

  const callback: RequestHandler = (req, res, next) => {
    const activeOverrideId = state.getActiveOverrideId(endpointId);

    if (activeOverrideId === 'none' || !activeOverrideId) {
      res.status(defaultStatus);
      res.send(defaultResponseBody);
      return;
    }

    const activeOverrideBehaviour =
      state.getActiveOverrideBehaviour(endpointId);

    if (!activeOverrideBehaviour) {
      res.status(500);
      res.send({ error: 'Override has no defined behaviour' });
      return;
    }

    const { status, responseBody } = activeOverrideBehaviour;
    res.status(status);
    res.send(responseBody);
  };

  return callback;
};
