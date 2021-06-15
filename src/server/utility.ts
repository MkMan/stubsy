import type {
  ConfigResponseEntry,
  StubsyEndpoints,
  StubsyOverrides,
  StubsyActiveOverrides,
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
