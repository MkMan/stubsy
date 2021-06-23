import express, { Express } from 'express';
import { json } from 'body-parser';
import http from 'http';
import path from 'path';

import {
  assert,
  generateEndpointCallback,
  generateUiConfigResponse,
} from './utility';
import type {
  ConfigPayload,
  ConfigResponseEntry,
  EndpointBehaviour,
  EndpointId,
  OverrideBehaviour,
  OverrideId,
  StubsyActiveOverrides,
  StubsyEndpoints,
  StubsyOverrides,
} from './types';

export class Stubsy {
  public app: Express;

  private endpoints: StubsyEndpoints = new Map();
  private overrides: StubsyOverrides = new Map();
  private activeOverrides: StubsyActiveOverrides = new Map();

  constructor(private portNumber?: number) {
    this.app = express();
    this.portNumber = portNumber;

    this.initialiseMiddleWare();
    this.initialiseUiRoute();
    this.initialiseConfigRoute();
  }

  /**
   * Starts the server at the portNumber specified in the constructor
   *
   * @deprecated Please use the instance variable `app` to start the server
   */
  public start(): http.Server {
    assert(
      typeof this.portNumber !== 'undefined',
      'portNumber not specified in the constructor'
    );
    console.log(
      `Stubsy is now listening on port ${this.portNumber}\nThe Stubsy UI can be accessed on http://localhost:${this.portNumber}/Stubsy`
    );
    return this.app.listen(this.portNumber);
  }

  public registerEndpoint(
    endpointId: EndpointId,
    endpointBehaviour: EndpointBehaviour
  ): void {
    assert(
      !this.endpoints.has(endpointId),
      `Endpoint with id ${endpointId} has already been defined`
    );

    this.endpoints.set(endpointId, endpointBehaviour);

    const { type, path } = endpointBehaviour;

    this.app[type](
      path,
      generateEndpointCallback({
        defaultStatus: endpointBehaviour.status,
        defaultResponseBody: endpointBehaviour.responseBody,
        activeOverrides: this.activeOverrides,
        overrides: this.overrides,
        endpointId,
      })
    );
  }

  public registerOverride(
    endpointId: EndpointId,
    overrideId: OverrideId,
    overrideBehaviour: OverrideBehaviour
  ): void {
    assert(
      this.endpoints.has(endpointId),
      `Endpoint with id${endpointId} has not been defined`
    );

    const overridesForEndpoint = this.overrides.get(endpointId);

    assert(
      !overridesForEndpoint?.has(overrideId),
      `An override with id ${overrideId} has already been set for endpoint ${endpointId}`
    );

    if (!overridesForEndpoint) {
      this.overrides.set(
        endpointId,
        new Map().set(overrideId, overrideBehaviour)
      );
      return;
    }

    overridesForEndpoint.set(overrideId, overrideBehaviour);
  }

  public activateOverride(
    endpointId: EndpointId,
    overrideId: OverrideId = 'none'
  ): void {
    this.activeOverrides.set(endpointId, overrideId);
  }

  private initialiseMiddleWare(): void {
    this.app.use(json());
  }

  private initialiseUiRoute(): void {
    this.app.use('/Stubsy', express.static(path.resolve(__dirname, './ui/')));
  }

  private initialiseConfigRoute(): void {
    this.app.post('/Stubsy/Config', (req, res, next) => {
      const { endpointId, overrideId }: ConfigPayload = req.body;

      this.activateOverride(endpointId, overrideId);
      res.send({ status: 'OK' });
    });

    this.app.get('/Stubsy/Config', (req, res, next) => {
      const response: ConfigResponseEntry[] = generateUiConfigResponse(
        this.endpoints,
        this.overrides,
        this.activeOverrides
      );

      res.send(response);
    });
  }
}
