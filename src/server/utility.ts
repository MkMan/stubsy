import { RequestHandler } from 'express';
import type {
  ConfigResponseEntry,
  StubsyEndpoints,
  StubsyOverrides,
  StubsyActiveOverrides,
  EndpointBehaviour,
  EndpointId,
} from './types';

export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export const generateUiConfigResponse = (
  endpoints: StubsyEndpoints,
  appOverrides: StubsyOverrides,
  activeOverrides: StubsyActiveOverrides
): ConfigResponseEntry[] => {
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

export const generateEndpointCallback = ({
  defaultStatus,
  defaultResponseBody,
  activeOverrides,
  overrides,
  endpointId,
}: {
  defaultStatus: EndpointBehaviour['status'];
  defaultResponseBody: EndpointBehaviour['responseBody'];
  activeOverrides: StubsyActiveOverrides;
  overrides: StubsyOverrides;
  endpointId: EndpointId;
}): RequestHandler => {
  const callback: RequestHandler = (req, res, next) => {
    const activeOverrideId = activeOverrides.get(endpointId);

    if (activeOverrideId === 'none' || !activeOverrideId) {
      res.status(defaultStatus);
      res.send(defaultResponseBody);
      return;
    }

    const activeOverrideBehaviour = overrides
      .get(endpointId)
      ?.get(activeOverrideId);

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
