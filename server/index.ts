import express, { Express } from 'express';
import { json } from 'body-parser';
import http from 'http';
import path from 'path';

import type {
  ConfigPayload,
  ConfigResponseEntry,
  EndpointBehaviour,
  EndpointId,
  OverrideBehaviour,
  OverrideId,
} from './types';

export class Stubsy {
  private app: Express;
  private portNumber: number;

  private endpoints: Map<EndpointId, EndpointBehaviour> = new Map();
  private overrides: Map<EndpointId, Map<OverrideId, OverrideBehaviour>> =
    new Map();
  private activeOverrides: Map<EndpointId, OverrideId> = new Map();

  constructor(portNumber: number) {
    this.app = express();
    this.portNumber = portNumber;

    this.initialiseMiddleWare();
    this.initialiseUiRoute();
    this.initialiseConfigRoute();
  }

  public start(): http.Server {
    console.log(`Stubsy is now listening on port ${this.portNumber}`);
    console.log(
      `The Stubsy UI can be accessed on http://localhost:${this.portNumber}/Stubsy`
    );
    return this.app.listen(this.portNumber);
  }

  public registerEndpoint(
    endpointId: EndpointId,
    endpointBehaviour: EndpointBehaviour
  ): void {
    if (this.endpoints.has(endpointId)) {
      console.error(`Endpoint with id ${endpointId} has already been defined`);
      return;
    }
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
        res.status(defaultStatus).send(defaultResponseBody);
        return;
      }

      const activeOverrideBehaviour = this.overrides
        .get(endpointId)
        ?.get(activeOverrideId);

      if (activeOverrideBehaviour) {
        const { status, responseBody } = activeOverrideBehaviour;
        res.status(status).send(responseBody);
        return;
      }
    });
  }

  public registerOverride(
    endpointId: EndpointId,
    overrideId: OverrideId,
    overrideBehaviour: OverrideBehaviour
  ): void {
    if (!this.endpoints.has(endpointId)) {
      console.error(`Endpoint with id${endpointId} has not been defined`);
      return;
    }

    const overridesForEndpoint = this.overrides.get(endpointId);

    if (!overridesForEndpoint) {
      this.overrides.set(
        endpointId,
        new Map().set(overrideId, overrideBehaviour)
      );
      return;
    }

    if (overridesForEndpoint.has(overrideId)) {
      console.error(
        `An override with id ${overrideId} has already been set for endpoint ${endpointId}`
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
      const response: ConfigResponseEntry[] = [];

      this.endpoints.forEach(({ path, type }, endpointId) => {
        const overridesForEndpoint = this.overrides.get(endpointId);

        if (!overridesForEndpoint) {
          response.push({ endpointId, path, type, overrides: [] });
          return;
        }

        const overrides: ConfigResponseEntry['overrides'] = [];
        overridesForEndpoint.forEach((_overrideBehaviour, overrideId) => {
          overrides.push({
            overrideId,
            isActive: this.activeOverrides.get(endpointId) === overrideId,
          });
        });
        response.push({ endpointId, path, type, overrides });
      });

      res.send(response);
    });
  }
}
