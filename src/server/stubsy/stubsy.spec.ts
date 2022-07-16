import mockExpress, {
  mockExpressFunctions,
  mockExpressStatic,
} from '../../../__mocks__/express';
import { json } from '../../../__mocks__/body-parser';
import * as stubsyUtilities from '../utility/utility';
import path from 'path';
import { Stubsy } from './stubsy';
import type { EndpointBehaviour, OverrideBehaviour } from '../types';
import { StubsyState } from '../state';

jest.mock('../state/state');

describe(`Stubsy`, () => {
  const portNumber = 0;

  let generateUiConfigResponseSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let assertSpy: jest.SpyInstance;
  let generateEndpointCallbackSpy: jest.SpyInstance;
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
    generateEndpointCallbackSpy = jest.spyOn(
      stubsyUtilities,
      'generateEndpointCallback'
    );
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    assertSpy.mockRestore();
    generateEndpointCallbackSpy.mockRestore();
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
        path.resolve(__dirname, '../ui/')
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
      expect(stubsyUtilities.generateUiConfigResponse).toHaveBeenCalled();
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

    it(`should throw an error if the portNumber is not defined when creating Stubsy`, () => {
      const badStubsy = new Stubsy();

      expect(() => {
        badStubsy.start();
      }).toThrow('portNumber not specified in the constructor');
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
      stubsyInstance = new Stubsy();
    });

    it(`should throw an error if the endpointId already exists`, () => {
      (
        StubsyState.getInstance().endpointExists as jest.Mock
      ).mockReturnValueOnce(true);

      expect(() => {
        stubsyInstance.registerEndpoint(endpointId, endpointBehaviour);
      }).toThrow(`Endpoint with id ${endpointId} has already been defined`);
    });

    it(`should add the endpoint to the state if the endpointId is not defined`, () => {
      stubsyInstance.registerEndpoint(endpointId, endpointBehaviour);

      expect(StubsyState.getInstance().addEndpoint).toHaveBeenCalledWith(
        endpointId,
        endpointBehaviour
      );
    });

    it(`should create an Express endpoint matching the specified behaviour`, () => {
      const endpointCallback = () => 'wazah';
      generateEndpointCallbackSpy.mockImplementation(() => endpointCallback);

      stubsyInstance.registerEndpoint(endpointId, endpointBehaviour);

      expect(stubsyInstance.app[endpointBehaviour.type]).toHaveBeenCalledWith(
        endpointBehaviour.path,
        endpointCallback
      );
    });
  });

  describe(`registerOverride`, () => {
    beforeEach(() => {
      stubsyInstance = new Stubsy(portNumber);
    });

    it(`should throw an error if the specified endpoint doesn't exist`, () => {
      const endpointId = 'undefinedEndpoint';
      (
        StubsyState.getInstance().endpointExists as jest.Mock
      ).mockReturnValueOnce(false);

      expect(() => {
        stubsyInstance.registerOverride(
          endpointId,
          'does not matter',
          undefined
        );
      }).toThrow(`Endpoint with id${endpointId} has not been defined`);
    });

    it(`should throw an error if an override with the same id has already been set`, () => {
      const endpointId = 'movies';
      const overrideId = '404';
      const overrideBehaviour: OverrideBehaviour = {
        status: 404,
        responseBody: {},
      };
      (
        StubsyState.getInstance().endpointExists as jest.Mock
      ).mockReturnValueOnce(true);
      (
        StubsyState.getInstance().overrideExists as jest.Mock
      ).mockReturnValueOnce(true);

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
      const overrideId = '404';
      const overrideBehaviour: OverrideBehaviour = {
        status: 404,
        responseBody: {},
      };
      (
        StubsyState.getInstance().endpointExists as jest.Mock
      ).mockReturnValueOnce(true);
      (
        StubsyState.getInstance().overrideExists as jest.Mock
      ).mockReturnValueOnce(false);

      stubsyInstance.registerOverride(
        endpointId,
        overrideId,
        overrideBehaviour
      );

      expect(StubsyState.getInstance().addOverride).toHaveBeenCalledWith(
        endpointId,
        overrideId,
        overrideBehaviour
      );
    });
  });

  describe(`activateOverride`, () => {
    const endpointId = 'endpoint';
    const overrideId = 'override';

    beforeEach(() => {
      stubsyInstance = new Stubsy();
    });

    it(`should set the active overrides when the override id is specified`, () => {
      stubsyInstance.activateOverride(endpointId, overrideId);

      expect(StubsyState.getInstance().setActiveOverride).toHaveBeenCalledWith(
        endpointId,
        overrideId
      );
    });

    it(`should set the active overrides when the override id is omitted`, () => {
      stubsyInstance.activateOverride(endpointId);

      expect(StubsyState.getInstance().setActiveOverride).toHaveBeenCalledWith(
        endpointId,
        'none'
      );
    });
  });
});
