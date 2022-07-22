import {
  EndpointBehaviour,
  OverrideBehaviour,
  StubsyActiveOverrides,
  StubsyEndpoints,
  StubsyOverrides,
} from '../types';

/** A container class for the server state with utility functions */
export class StubsyState {
  private static instance: StubsyState;

  private _endpoints: StubsyEndpoints;
  private _overrides: StubsyOverrides;
  private _activeOverrides: StubsyActiveOverrides;

  private constructor() {
    this._endpoints = new Map();
    this._overrides = new Map();
    this._activeOverrides = new Map();
  }

  public static getInstance(): StubsyState {
    if (!StubsyState.instance) {
      StubsyState.instance = new StubsyState();
    }
    return StubsyState.instance;
  }

  get endpoints(): StubsyEndpoints {
    return this._endpoints;
  }

  get overrides(): StubsyOverrides {
    return this._overrides;
  }

  get activeOverrides(): StubsyActiveOverrides {
    return this._activeOverrides;
  }

  endpointExists(endpointId: string): boolean {
    return this._endpoints.has(endpointId);
  }

  overrideExists(endpointId: string, overrideId: string): boolean {
    return !!this._overrides.get(endpointId)?.has(overrideId);
  }

  getEndpointBehaviour(endpointId: string): EndpointBehaviour | null {
    return this._endpoints.get(endpointId) ?? null;
  }

  getOverrideBehaviour(
    endpointId: string,
    overrideId: string
  ): OverrideBehaviour | null {
    return this._overrides.get(endpointId)?.get(overrideId) ?? null;
  }

  addEndpoint(endpointId: string, endpointBehaviour: EndpointBehaviour): void {
    this._endpoints.set(endpointId, endpointBehaviour);
  }

  addOverride(
    endpointId: string,
    overrideId: string,
    overrideBehaviour: OverrideBehaviour
  ): void {
    const overridesForEndpoint = this._overrides.get(endpointId);

    if (overridesForEndpoint) {
      overridesForEndpoint.set(overrideId, overrideBehaviour);
    } else {
      this._overrides.set(
        endpointId,
        new Map().set(overrideId, overrideBehaviour)
      );
    }
  }

  setActiveOverride(endpointId: string, overrideId: string): void {
    this._activeOverrides.set(endpointId, overrideId);
  }

  getActiveOverrideId(endpointId: string): string | null {
    return this._activeOverrides.get(endpointId) ?? null;
  }

  getActiveOverrideBehaviour(endpointId: string): OverrideBehaviour | null {
    const activeOverrideId = this.getActiveOverrideId(endpointId) ?? '';
    return this._overrides.get(endpointId)?.get(activeOverrideId) ?? null;
  }
}
