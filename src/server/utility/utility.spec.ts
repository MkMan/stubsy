import {
  assert,
  generateUiConfigResponse,
  generateEndpointCallback,
} from './utility';
import type {
  StubsyEndpoints,
  StubsyOverrides,
  StubsyActiveOverrides,
  OverrideBehaviour,
  EndpointBehaviour,
  Endpoint,
} from '../types';
import { StubsyState } from '../state';

jest.mock('../state/state');

describe(`Stubsy Utility functions`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`assert`, () => {
    const errorMessage = 'quick mafs';

    it(`should throw an error if the condition is not met`, () => {
      expect(() => {
        assert(2 + 2 != 4, errorMessage);
      }).toThrow(errorMessage);
    });

    it(`should not throw an error if the condition is met`, () => {
      expect(() => {
        assert(2 + 2 === 4, errorMessage);
      }).not.toThrow();
    });
  });

  describe(`generateUiConfigResponse`, () => {
    it(`should return an empty response if there are no endpoints`, () => {
      (StubsyState.getInstance as jest.Mock).mockReturnValueOnce({
        endpoints: new Map(),
      });

      const response = generateUiConfigResponse();

      expect(response).toEqual([]);
    });

    it(`should return a correctly structured response for the UI`, () => {
      const endpoint1Id = 'movies';
      const endpoint2Id = 'books';
      const endpoint3Id = 'shows';
      const override1Id1 = 'movies-404';
      const override1Id2 = 'movies-500';
      const override3Id1 = 'shows-200';

      const endpoint1Behaviour: EndpointBehaviour = {
        path: '/movies',
        type: 'get',
        status: 200,
        responseBody: ['Inception', 'Tenet'],
      };
      const endpoint2Behaviour: EndpointBehaviour = {
        path: '/books',
        type: 'post',
        status: 404,
        responseBody: { message: 'resource not found' },
      };
      const endpoint3Behaviour: EndpointBehaviour = {
        path: '/shows',
        type: 'delete',
        status: 500,
        responseBody: { message: 'outage!' },
      };

      const override1Behaviour1: OverrideBehaviour = {
        status: 500,
        responseBody: { message: 'movies endpoint 500' },
      };
      const override1Behaviour2: OverrideBehaviour = {
        status: 404,
        responseBody: { message: 'movies endpoint 404' },
      };
      const override3Behaviour1: OverrideBehaviour = {
        status: 200,
        responseBody: ['24', 'Attack on Titan'],
      };

      const endpoints: StubsyEndpoints = new Map()
        .set(endpoint1Id, endpoint1Behaviour)
        .set(endpoint2Id, endpoint2Behaviour)
        .set(endpoint3Id, endpoint3Behaviour);

      const overrides: StubsyOverrides = new Map()
        .set(
          endpoint1Id,
          new Map()
            .set(override1Id1, override1Behaviour1)
            .set(override1Id2, override1Behaviour2)
        )
        .set(endpoint3Id, new Map().set(override3Id1, override3Behaviour1));

      const activeOverrides: StubsyActiveOverrides = new Map()
        .set(endpoint1Id, override1Id1)
        .set(endpoint3Id, override3Behaviour1);

      (StubsyState.getInstance as jest.Mock).mockReturnValueOnce({
        endpoints,
        overrides,
        activeOverrides,
      });

      expect(generateUiConfigResponse()).toMatchSnapshot();
    });
  });

  describe(`generateEndpointCallback`, () => {
    const responseMock = {
      send: jest.fn(),
      status: jest.fn(),
    };
    const endpointId = 'books';
    const status: EndpointBehaviour['status'] = 200;
    const responseBody: EndpointBehaviour['responseBody'] = [
      'book 1',
      'book 2',
    ];
    const endpoint: Endpoint = { endpointId, responseBody, status } as Endpoint;

    it(`should return the default endpoint behaviour if it has not got an active override`, () => {
      jest.useFakeTimers();
      const endpointCallback = generateEndpointCallback(endpoint);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      endpointCallback(undefined as any, responseMock as any, undefined as any);
      jest.advanceTimersByTime(0);

      expect(responseMock.status).toHaveBeenCalledWith(status);
      expect(responseMock.send).toHaveBeenCalledWith(responseBody);
    });

    it(`should correctly handle a delay in the default endpoint behaviour`, () => {
      jest.useFakeTimers();
      const endpointCallback = generateEndpointCallback({
        ...endpoint,
        delay: 1000,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      endpointCallback(undefined as any, responseMock as any, undefined as any);

      expect(responseMock.status).not.toHaveBeenCalled();
      expect(responseMock.send).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);

      expect(responseMock.status).toHaveBeenCalledWith(status);
      expect(responseMock.send).toHaveBeenCalledWith(responseBody);
    });

    it(`should return an error response if the overrideId has no set behaviour`, () => {
      (
        StubsyState.getInstance().getActiveOverrideId as jest.Mock
      ).mockReturnValueOnce('active-override-id');
      (
        StubsyState.getInstance().getActiveOverrideBehaviour as jest.Mock
      ).mockReturnValueOnce(undefined);
      const endpointCallback = generateEndpointCallback(endpoint);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      endpointCallback(undefined as any, responseMock as any, undefined as any);

      expect(responseMock.status).toHaveBeenCalledWith(500);
      expect(responseMock.send).toHaveBeenCalledWith({
        error: 'Override has no defined behaviour',
      });
    });

    it(`should return the override behaviour if it is set`, () => {
      jest.useFakeTimers();
      const overrideId = 'overrideId';
      const overrideBehaviour: OverrideBehaviour = {
        status: 404,
        responseBody: { message: 'resource not found' },
      };
      (
        StubsyState.getInstance().getActiveOverrideId as jest.Mock
      ).mockReturnValueOnce(overrideId);
      (
        StubsyState.getInstance().getActiveOverrideBehaviour as jest.Mock
      ).mockReturnValueOnce(overrideBehaviour);

      const endpointCallback = generateEndpointCallback(endpoint);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      endpointCallback(undefined as any, responseMock as any, undefined as any);
      jest.advanceTimersByTime(0);

      expect(responseMock.status).toHaveBeenCalledWith(
        overrideBehaviour.status
      );
      expect(responseMock.send).toHaveBeenCalledWith(
        overrideBehaviour.responseBody
      );
    });

    it(`should return the override behaviour if it is set`, () => {
      jest.useFakeTimers();
      const overrideId = 'overrideId';
      const overrideBehaviour: OverrideBehaviour = {
        status: 404,
        responseBody: { message: 'resource not found' },
        delay: 1000,
      };
      (
        StubsyState.getInstance().getActiveOverrideId as jest.Mock
      ).mockReturnValueOnce(overrideId);
      (
        StubsyState.getInstance().getActiveOverrideBehaviour as jest.Mock
      ).mockReturnValueOnce(overrideBehaviour);

      const endpointCallback = generateEndpointCallback(endpoint);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      endpointCallback(undefined as any, responseMock as any, undefined as any);

      expect(responseMock.status).not.toHaveBeenCalled();
      expect(responseMock.send).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);

      expect(responseMock.status).toHaveBeenCalledWith(
        overrideBehaviour.status
      );
      expect(responseMock.send).toHaveBeenCalledWith(
        overrideBehaviour.responseBody
      );
    });
  });
});
