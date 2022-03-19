import mockExpress, {
  mockExpressFunctions,
  mockExpressStatic,
} from '../../__mocks__/express';
import { json } from '../../__mocks__/body-parser';
import path from 'path';
import * as utils from './utility/utility';
import { StubsyState } from './state';
import {
  activateOverride,
  createServer,
  registerEndpoint,
  registerOverride,
} from './stubsy';
import type { Endpoint, Override } from './types';

jest.mock('./state/state');

describe(`Stubsy`, () => {
  const mockResponseObject = {
    send: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`#createServer`, () => {
    it(`should create and return a server if one is not provided`, () => {
      const app = createServer();

      expect(mockExpress).toHaveBeenCalled();
      expect(app).toBe(mockExpress());
    });

    it(`should not create a server if one is provided`, () => {
      const myExistingServer = mockExpress();
      mockExpress.mockClear();

      const app = createServer(myExistingServer as any);

      expect(mockExpress).not.toHaveBeenCalled();
      expect(app).toBe(myExistingServer);
    });

    it(`should initialise the json middleware`, () => {
      createServer();

      expect(json).toHaveBeenCalled();
    });

    it(`should initialise the static files routes`, () => {
      createServer();

      expect(mockExpressStatic).toHaveBeenCalledWith(
        path.resolve(__dirname, './ui/')
      );
      expect(mockExpressFunctions.use).toHaveBeenCalledWith(
        '/Stubsy',
        mockExpressStatic.getMockImplementation()?.()
      );
    });

    it(`should set up the POST config route`, () => {
      const mockRequestObject = {
        body: {
          endpointId: 'books',
          overrideId: 'outage',
        },
      };

      createServer();
      const routeCallbackFunction = mockExpressFunctions.post.mock.calls[0][1];
      routeCallbackFunction(mockRequestObject, mockResponseObject);

      expect(mockExpressFunctions.post).toHaveBeenCalledWith(
        '/Stubsy/Config',
        expect.any(Function)
      );
      expect(mockResponseObject.send).toHaveBeenCalledWith({ status: 'OK' });
    });

    it(`should set up the GET config route`, () => {
      const mockUiConfig = { route: 'yes' };
      jest
        .spyOn(utils, 'generateUiConfigResponse')
        .mockReturnValue(mockUiConfig as any);

      createServer();
      const routeCallbackFunction = mockExpressFunctions.get.mock.calls[0][1];
      routeCallbackFunction(null, mockResponseObject);

      expect(mockExpressFunctions.get).toHaveBeenCalledWith(
        '/Stubsy/Config',
        expect.any(Function)
      );
      expect(mockResponseObject.send).toHaveBeenCalledWith(mockUiConfig);
    });
  });

  describe(`#activateOverride`, () => {
    it(`should call setActiveOverride`, () => {
      const endpointId = 'books';
      const overrideId = '404';

      activateOverride(endpointId, overrideId);

      expect(StubsyState.getInstance().setActiveOverride).toHaveBeenCalledWith(
        endpointId,
        overrideId
      );
    });

    it(`should use the default overrideId when it's not provided`, () => {
      const endpointId = 'books';

      activateOverride(endpointId);

      expect(StubsyState.getInstance().setActiveOverride).toHaveBeenCalledWith(
        endpointId,
        'none'
      );
    });
  });

  describe(`#registerEndpoint`, () => {
    const mockApp = mockExpress() as any;
    const endpoint: Endpoint = {
      endpointId: 'myAwesomeEndpoint',
      path: '/planes',
      type: 'get',
      status: 200,
      responseBody: {},
    };

    it(`should throw an error if the endpointId already exists`, () => {
      (
        StubsyState.getInstance().endpointExists as jest.Mock
      ).mockReturnValueOnce(true);

      expect(() => {
        registerEndpoint(mockApp, endpoint);
      }).toThrow(
        `Endpoint with id ${endpoint.endpointId} has already been defined`
      );
    });

    it(`should add the endpoint to the instance if the endpointId is not defined`, () => {
      registerEndpoint(mockApp, endpoint);
      const { endpointId, ...endpointBehaviour } = endpoint;

      expect(StubsyState.getInstance().addEndpoint).toHaveBeenCalledWith(
        endpointId,
        {
          ...endpointBehaviour,
        }
      );
    });

    it(`should create an Express endpoint matching the specified behaviour`, () => {
      const endpointCallback = () => 'wazah';
      jest
        .spyOn(utils, 'generateEndpointCallback')
        .mockImplementationOnce(() => endpointCallback);

      registerEndpoint(mockApp, endpoint);

      expect(mockApp[endpoint.type]).toHaveBeenCalledWith(
        endpoint.path,
        endpointCallback
      );
    });
  });

  describe(`#registerOverride`, () => {
    it(`should throw an error if the specified endpoint doesn't exist`, () => {
      (
        StubsyState.getInstance().endpointExists as jest.Mock
      ).mockReturnValueOnce(false);
      const endpointId = 'undefinedEndpoint';

      expect(() => {
        registerOverride(endpointId, 'does not matter' as any);
      }).toThrow(`Endpoint with id${endpointId} has not been defined`);
    });

    it(`should throw an error if an override with the same id has already been set`, () => {
      const endpointId = 'movies';
      const overrideId = 'notFound';
      const override: Override = {
        overrideId,
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
        registerOverride(endpointId, override);
      }).toThrow(
        `An override with id ${overrideId} has already been set for endpoint ${endpointId}`
      );
    });

    it(`should add the specified override to the previous overrides for the endpoint`, () => {
      (
        StubsyState.getInstance().endpointExists as jest.Mock
      ).mockReturnValueOnce(true);
      (
        StubsyState.getInstance().overrideExists as jest.Mock
      ).mockReturnValueOnce(false);
      const endpointId = 'movies';
      const overrideId = '404';
      const overrideBehaviour = { status: 404, responseBody: {} };
      const override: Override = {
        overrideId,
        ...overrideBehaviour,
      };

      registerOverride(endpointId, override);

      expect(StubsyState.getInstance().addOverride).toHaveBeenCalledWith(
        endpointId,
        overrideId,
        overrideBehaviour
      );
    });
  });
});
