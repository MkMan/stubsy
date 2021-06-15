import mockExpress, {
  mockExpressFunctions,
  mockExpressStatic,
} from '../../__mocks__/express';
import { json } from '../../__mocks__/body-parser';
import * as stubsyUtilities from './utility';
import path from 'path';
import { Stubsy } from './stubsy';
import type { EndpointBehaviour, OverrideBehaviour } from './types';

describe(`Stubsy`, () => {
  const portNumber = 0;

  let generateUiConfigResponseSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let assertSpy: jest.SpyInstance;
  const responseMock = {
    send: jest.fn(),
    status: jest.fn(),
  };

  let stubsyInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    generateUiConfigResponseSpy = jest.spyOn(
      stubsyUtilities,
      'generateUiConfigResponse'
    );
    consoleLogSpy = jest.spyOn(console, 'log');
    assertSpy = jest.spyOn(stubsyUtilities, 'assert');
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    assertSpy.mockRestore();
  });

  describe(`constructor`, () => {
    const mockUiResponse = '2 + 2 = 4';

    beforeEach(() => {
      generateUiConfigResponseSpy.mockReturnValue(mockUiResponse as any);

      stubsyInstance = new Stubsy(portNumber);
    });

    it(`should create an Express app`, () => {
      expect(mockExpress).toHaveBeenCalled();
      expect(stubsyInstance.app).toBe(mockExpressFunctions);
    });

    it(`should initialise the portNumber instance variable`, () => {
      expect(stubsyInstance.portNumber).toEqual(portNumber);
    });

    it(`should initialise the json middleware`, () => {
      expect(json).toHaveBeenCalled();
    });

    it(`should initialise the UI route`, () => {
      expect(mockExpressStatic).toHaveBeenCalledWith(
        path.resolve(__dirname, './ui/')
      );
      expect(stubsyInstance.app.use).toHaveBeenCalledWith(
        '/Stubsy',
        mockExpressStatic.getMockImplementation()?.()
      );
    });

    it(`should initialise the Config route`, () => {
      const requestMock = {
        body: {
          endpointId: 'endpointId',
          overrideId: 'overrideId',
        },
      };
      jest.spyOn(stubsyInstance, 'activateOverride');
      const postConfigCallback = (stubsyInstance.app.post as jest.Mock).mock
        .calls[0][1];
      postConfigCallback(requestMock, responseMock);
      const getConfigCallback = (stubsyInstance.app.get as jest.Mock).mock
        .calls[0][1];

      postConfigCallback(requestMock, responseMock);
      getConfigCallback(requestMock, responseMock);

      expect(stubsyInstance.app.post).toHaveBeenCalledWith(
        '/Stubsy/Config',
        expect.any(Function)
      );
      expect(stubsyInstance.activateOverride).toHaveBeenCalledWith(
        requestMock.body.endpointId,
        requestMock.body.overrideId
      );
      expect(responseMock.send).toHaveBeenCalledWith({ status: 'OK' });

      expect(stubsyInstance.app.get).toHaveBeenCalledWith(
        '/Stubsy/Config',
        expect.any(Function)
      );
      expect(stubsyUtilities.generateUiConfigResponse).toHaveBeenCalledWith(
        stubsyInstance.endpoints,
        stubsyInstance.overrides,
        stubsyInstance.activeOverrides
      );
      expect(responseMock.send).toHaveBeenCalledWith(mockUiResponse);
    });
  });

  describe(`start`, () => {
    beforeEach(() => {
      consoleLogSpy.mockImplementation(() => undefined);

      stubsyInstance = new Stubsy(portNumber);
      stubsyInstance.start();
    });

    it(`should log how to access the server to the user`, () => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Stubsy is now listening on port ${portNumber}\nThe Stubsy UI can be accessed on http://localhost:${portNumber}/Stubsy`
      );
    });

    it(`should start the server on the port number specified`, () => {
      expect(stubsyInstance.app.listen).toHaveBeenCalledWith(
        stubsyInstance.portNumber
      );
    });
  });

  describe(`registerEndpoint`, () => {
    const endpointId = 'myAwesomeEndpoint';
    const endpointBehaviour: EndpointBehaviour = {
      path: '/planes',
      type: 'get',
      status: 200,
      responseBody: {},
    };

    beforeEach(() => {
      stubsyInstance = new Stubsy(portNumber);
    });

    it(`should throw an error if the endpointId already exists`, () => {
      stubsyInstance.endpoints.set(endpointId, endpointBehaviour);

      expect(() => {
        stubsyInstance.registerEndpoint(endpointId, endpointBehaviour);
      }).toThrow(`Endpoint with id ${endpointId} has already been defined`);
    });

    it(`should add the endpoint to the instance if the endpointId is not defined`, () => {
      stubsyInstance.registerEndpoint(endpointId, endpointBehaviour);

      expect(stubsyInstance.endpoints.get(endpointId)).toEqual(
        endpointBehaviour
      );
    });

    it(`should create an Express endpoint matching the specified behaviour`, () => {
      stubsyInstance.registerEndpoint(endpointId, endpointBehaviour);

      expect(stubsyInstance.app[endpointBehaviour.type]).toHaveBeenCalledWith(
        endpointBehaviour.path,
        expect.any(Function)
      );
    });

    it(`should return the default endpoint behaviour if it has not got an active override`, () => {
      stubsyInstance.registerEndpoint(endpointId, endpointBehaviour);

      const endpointCallback = (
        stubsyInstance.app[endpointBehaviour.type] as jest.Mock
      ).mock.calls.slice(-1)[0][1]; // second argument of the last call

      endpointCallback(undefined, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(
        endpointBehaviour.status
      );
      expect(responseMock.send).toHaveBeenCalledWith(
        endpointBehaviour.responseBody
      );
    });

    it(`should return an error response if the overrideId has no set behaviour`, () => {
      const overrideId = 'overrideId';

      stubsyInstance.activeOverrides.set(endpointId, overrideId);

      stubsyInstance.registerEndpoint(endpointId, endpointBehaviour);
      const endpointCallback = (
        stubsyInstance.app[endpointBehaviour.type] as jest.Mock
      ).mock.calls.slice(-1)[0][1]; // second argument of the last call

      endpointCallback(undefined, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(500);
      expect(responseMock.send).toHaveBeenCalledWith({
        error: 'Override has no defined behaviour',
      });
    });

    it(`should return the override behaviour if it is set`, () => {
      const overrideId = 'overrideId';
      const overrideBehaviour: OverrideBehaviour = {
        status: 404,
        responseBody: { message: 'resource not found' },
      };

      stubsyInstance.activeOverrides.set(endpointId, overrideId);
      stubsyInstance.overrides.set(
        endpointId,
        new Map().set(overrideId, overrideBehaviour)
      );

      stubsyInstance.registerEndpoint(endpointId, endpointBehaviour);
      const endpointCallback = (
        stubsyInstance.app[endpointBehaviour.type] as jest.Mock
      ).mock.calls.slice(-1)[0][1]; // second argument of the last call

      endpointCallback(undefined, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(
        overrideBehaviour.status
      );
      expect(responseMock.send).toHaveBeenCalledWith(
        overrideBehaviour.responseBody
      );
    });
  });

  describe(`registerOverride`, () => {
    beforeEach(() => {
      stubsyInstance = new Stubsy(portNumber);
    });

    it(`should throw an error if the specified endpoint doesn't exist`, () => {
      const endpointId = 'undefinedEndpoint';

      expect(() => {
        stubsyInstance.registerOverride(
          endpointId,
          'does not matter',
          undefined
        );
      }).toThrow(`Endpoint with id${endpointId} has not been defined`);
    });

    it(`should initialise the endpoint's override Map if it doesn't exit`, () => {
      const endpointId = 'movies';
      const overrideId = '404';
      const overrideBehaviour: OverrideBehaviour = {
        status: 404,
        responseBody: {},
      };
      const numberOfOverridesBefore = stubsyInstance.overrides.size;

      stubsyInstance.endpoints.set(endpointId, undefined);

      stubsyInstance.registerOverride(
        endpointId,
        overrideId,
        overrideBehaviour
      );

      expect(stubsyInstance.overrides.size).toEqual(
        numberOfOverridesBefore + 1
      );
      expect(stubsyInstance.overrides.get(endpointId).get(overrideId)).toBe(
        overrideBehaviour
      );
    });

    it(`should throw an error if an override with the same id has already been set`, () => {
      const endpointId = 'movies';
      const overrideId = '404';
      const overrideBehaviour: OverrideBehaviour = {
        status: 404,
        responseBody: {},
      };

      stubsyInstance.endpoints.set(endpointId, undefined);
      stubsyInstance.registerOverride(
        endpointId,
        overrideId,
        overrideBehaviour
      );

      expect(() => {
        stubsyInstance.registerOverride(
          endpointId,
          overrideId,
          overrideBehaviour
        );
      }).toThrow(
        `An override with id ${overrideId} has already been set for endpoint ${endpointId}`
      );
    });

    it(`should add the specified override to the previous overrides for the endpoint`, () => {
      const endpointId = 'movies';
      const override1Id = '404';
      const override2Id = '500';
      const override1Behaviour: OverrideBehaviour = {
        status: 404,
        responseBody: {},
      };
      const override2Behaviour: OverrideBehaviour = {
        status: 500,
        responseBody: {},
      };

      stubsyInstance.endpoints.set(endpointId, undefined);
      stubsyInstance.registerOverride(
        endpointId,
        override1Id,
        override1Behaviour
      );
      stubsyInstance.registerOverride(
        endpointId,
        override2Id,
        override2Behaviour
      );

      expect(stubsyInstance.overrides.get(endpointId).size).toEqual(2);
    });
  });

  describe(`activateOverride`, () => {
    const endpointId = 'endpoint';
    const overrideId = 'override';

    beforeEach(() => {
      stubsyInstance = new Stubsy(portNumber);
    });

    it(`should set the active overrides when the override id is specified`, () => {
      stubsyInstance.activateOverride(endpointId, overrideId);

      expect(stubsyInstance.activeOverrides.get(endpointId)).toEqual(
        overrideId
      );
    });

    it(`should set the active overrides when the override id is omitted`, () => {
      stubsyInstance.activateOverride(endpointId);

      expect(stubsyInstance.activeOverrides.get(endpointId)).toEqual('none');
    });
  });
});
