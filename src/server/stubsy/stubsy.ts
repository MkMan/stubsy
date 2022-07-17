import express, { Express } from 'express';
import { json } from 'body-parser';
import http from 'http';
import path from 'path';

import {
  assert,
  generateEndpointCallback,
  generateUiConfigResponse,
} from '../utility';
import type {
  ConfigPayload,
  ConfigResponseEntry,
  EndpointBehaviour,
  EndpointId,
  OverrideBehaviour,
  OverrideId,
} from '../types';

import { StubsyState } from '../state';

export class Stubsy {
  public app: Express;

  private state: StubsyState;

  constructor(private portNumber?: number) {
    this.app = express();
    this.portNumber = portNumber;

    this.state = StubsyState.getInstance();

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
      !this.state.endpointExists(endpointId),
      `Endpoint with id ${endpointId} has already been defined`
    );

    this.state.addEndpoint(endpointId, endpointBehaviour);

    const { type, path } = endpointBehaviour;

    this.app[type](
      path,
      generateEndpointCallback({
        ...endpointBehaviour,
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
      this.state.endpointExists(endpointId),
      `Endpoint with id${endpointId} has not been defined`
    );

    assert(
      !this.state.overrideExists(endpointId, overrideId),
      `An override with id ${overrideId} has already been set for endpoint ${endpointId}`
    );

    this.state.addOverride(endpointId, overrideId, overrideBehaviour);
  }

  public activateOverride(
    endpointId: EndpointId,
    overrideId: OverrideId = 'none'
  ): void {
    this.state.setActiveOverride(endpointId, overrideId);
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
      const response: ConfigResponseEntry[] = generateUiConfigResponse();

      res.send(response);
    });
  }
}
