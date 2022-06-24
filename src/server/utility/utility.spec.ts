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
} from '../types';

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
    const emptyMap = new Map();

    it(`should return an empty response if there are not endpoints`, () => {
      const response = generateUiConfigResponse(emptyMap, emptyMap, emptyMap);

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

      expect(
        generateUiConfigResponse(endpoints, overrides, activeOverrides)
      ).toMatchSnapshot();
    });
  });

  describe(`generateEndpointCallback`, () => {
    const responseMock = {
      send: jest.fn(),
      status: jest.fn(),
    };
    const defaultStatus: EndpointBehaviour['status'] = 200;
    const defaultResponseBody: EndpointBehaviour['responseBody'] = [
      'book 1',
      'book 2',
    ];
    const endpointId = 'books';
    const activeOverrides: StubsyActiveOverrides = new Map<string, string>();
    const overrides: StubsyOverrides = new Map();

    beforeEach(() => {
      overrides.clear();
      activeOverrides.clear();
    });

    it(`should return the default endpoint behaviour if it has not got an active override`, () => {
      const endpointCallback = generateEndpointCallback({
        defaultStatus,
        defaultResponseBody,
        activeOverrides,
        overrides,
        endpointId,
      }) as any;

      endpointCallback(undefined, responseMock, undefined);

      expect(responseMock.status).toHaveBeenCalledWith(defaultStatus);
      expect(responseMock.send).toHaveBeenCalledWith(defaultResponseBody);
    });

    it(`should return an error response if the overrideId has no set behaviour`, () => {
      const overrideId = 'books-400';
      activeOverrides.set(endpointId, overrideId);
      const endpointCallback = generateEndpointCallback({
        defaultStatus,
        defaultResponseBody,
        activeOverrides,
        overrides,
        endpointId,
      }) as any;

      endpointCallback(undefined, responseMock, undefined);

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
      activeOverrides.set(endpointId, overrideId);
      overrides.set(endpointId, new Map().set(overrideId, overrideBehaviour));

      const endpointCallback = generateEndpointCallback({
        defaultStatus,
        defaultResponseBody,
        activeOverrides,
        overrides,
        endpointId,
      }) as any;

      endpointCallback(undefined, responseMock, undefined);

      expect(responseMock.status).toHaveBeenCalledWith(
        overrideBehaviour.status
      );
      expect(responseMock.send).toHaveBeenCalledWith(
        overrideBehaviour.responseBody
      );
    });
  });
});
