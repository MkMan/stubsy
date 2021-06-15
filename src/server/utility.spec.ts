import { generateUiConfigResponse } from './utility';
import type {
  StubsyEndpoints,
  StubsyOverrides,
  StubsyActiveOverrides,
  OverrideBehaviour,
  EndpointBehaviour,
} from './types';

describe(`Stubsy Utility functions`, () => {
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
});
