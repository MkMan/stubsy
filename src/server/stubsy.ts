import express, { Express } from 'express';
import { json } from 'body-parser';
import http from 'http';
import path from 'path';

import { assert, generateUiConfigResponse } from './utility';
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
  private app: Express;

  private endpoints: StubsyEndpoints = new Map();
  private overrides: StubsyOverrides = new Map();
  private activeOverrides: StubsyActiveOverrides = new Map();

  constructor(private portNumber: number) {
    this.app = express();
    this.portNumber = portNumber;

    this.initialiseMiddleWare();
    this.initialiseUiRoute();
    this.initialiseConfigRoute();
  }

  public start(): http.Server {
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

    const {
      type,
      path,
      status: defaultStatus,
      responseBody: defaultResponseBody,
    } = endpointBehaviour;

    this.app[type](path, (req, res, next) => {
      const activeOverrideId = this.activeOverrides.get(endpointId);

      if (activeOverrideId === 'none' || !activeOverrideId) {
        res.status(defaultStatus);
        res.send(defaultResponseBody);
        return;
      }

      const activeOverrideBehaviour = this.overrides
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
    });
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
