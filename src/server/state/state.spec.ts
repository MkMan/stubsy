import { EndpointBehaviour, OverrideBehaviour } from '../types';
import { StubsyState } from './state';

type StubsStateWithoutTS = Omit<
  StubsyState,
  '_endpoints' | '_overrides' | '_activeOverrides'
> & {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  _activeOverrides: Map<string, any>;
  _endpoints: Map<string, any>;
  _overrides: Map<string, any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
};

describe(`StubsyState`, () => {
  let state: StubsStateWithoutTS;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const StubsyStateWithoutTs = StubsyState as any;
    state = new StubsyStateWithoutTs();
  });

  describe(`#getInstance`, () => {
    it(`should return the same instance every time`, () => {
      const state1 = StubsyState.getInstance();
      const state2 = StubsyState.getInstance();

      expect(state1).toBe(state2);
    });
  });

  describe(`#endpoints`, () => {
    it(`should return the current value of the endpoints`, () => {
      const endpoints = new Map().set('endpointId', {});
      state._endpoints = endpoints;

      expect(state.endpoints).toBe(endpoints);
    });
  });

  describe(`#overrides`, () => {
    it(`should return the current value of the overrides`, () => {
      const overrides = new Map().set('overrideId', {});
      state._overrides = overrides;

      expect(state.overrides).toBe(overrides);
    });
  });

  describe(`#activeOverrides`, () => {
    it(`should return the current value of the activeOverrides`, () => {
      const activeOverrides = new Map().set('override1', {});
      state._activeOverrides = activeOverrides;

      expect(state.activeOverrides).toBe(activeOverrides);
    });
  });

  describe(`#endpointExists`, () => {
    it(`should return whether the endpoint exists or not`, () => {
      state._endpoints.set('endpointId', 'not necessary');

      expect(state.endpointExists('endpointId')).toBe(true);
      expect(state.endpointExists('non existent endpoint')).toBe(false);
    });
  });

  describe(`#overrideExists`, () => {
    it(`should return true if override exists`, () => {
      state._overrides.set(
        'endpointId',
        new Map().set('overrideId', 'not needed')
      );

      expect(state.overrideExists('endpointId', 'overrideId')).toBe(true);
    });

    it(`should return false if the override doesn't exist`, () => {
      state._overrides.set(
        'endpointId',
        new Map().set('overrideId', 'not needed')
      );

      expect(state.overrideExists('endpointId', 'some other override id')).toBe(
        false
      );
    });

    it(`should return false if there are no overrides for the endpointId`, () => {
      state._overrides.set('endpointId', 'not needed');

      expect(state.overrideExists('some bad endpoint id', 'overrideId')).toBe(
        false
      );
    });
  });

  describe(`#getEndpointBehaviour`, () => {
    const endpointBehaviour = { path: '/home' };
    const endpointId = 'myHome';
    const endpoints = new Map().set(endpointId, endpointBehaviour);

    beforeEach(() => {
      state._endpoints = endpoints;
    });

    it(`should return the endpoint behaviour given an endpointId`, () => {
      expect(state.getEndpointBehaviour(endpointId)).toBe(endpointBehaviour);
    });

    it(`should return null if there is no endpoint behaviour registered`, () => {
      expect(state.getEndpointBehaviour('fake id')).toBeNull();
    });
  });

  describe(`#getOverrideBehaviour`, () => {
    const endpointId = 'home';
    const overrideId = '200';
    const overrideBehaviour = { status: 200 };
    const overrides = new Map().set(
      endpointId,
      new Map().set(overrideId, overrideBehaviour)
    );

    beforeEach(() => {
      state._overrides = overrides;
    });

    it(`should return the overrideBehaviour if it's found`, () => {
      expect(state.getOverrideBehaviour(endpointId, overrideId)).toBe(
        overrideBehaviour
      );
    });

    it(`should return null if there are no overrides for the endpointId`, () => {
      expect(
        state.getOverrideBehaviour('fakeEndpointId', overrideId)
      ).toBeNull();
    });

    it(`should return null if the overrideId has no registered behaviour`, () => {
      expect(
        state.getOverrideBehaviour(endpointId, 'invalidOverrideId')
      ).toBeNull();
    });
  });

  describe(`#addEndpoint`, () => {
    it(`should add the endpoint`, () => {
      const endpointId = 'home';
      const endpointBehaviour = { status: 200 };

      state.addEndpoint(endpointId, endpointBehaviour as EndpointBehaviour);

      expect(state._endpoints.get(endpointId)).toBe(endpointBehaviour);
    });
  });

  describe(`#addOverride`, () => {
    const endpointId = 'home';
    const overrideId = '404';
    const overrideBehaviour = { status: 200 };

    it(`should add the override to existing overrides for the endpoint`, () => {
      state._overrides = new Map().set(
        endpointId,
        new Map().set('someOtherOverride', {})
      );

      state.addOverride(
        endpointId,
        overrideId,
        overrideBehaviour as OverrideBehaviour
      );

      expect(state._overrides.get(endpointId).size).toBe(2);
      expect(state._overrides.get(endpointId).get(overrideId)).toBe(
        overrideBehaviour
      );
    });

    it(`should create a map with the override if the endpoint previously had no registered overrides`, () => {
      expect(state._overrides.get(endpointId)).toBeUndefined();

      state.addOverride(
        endpointId,
        overrideId,
        overrideBehaviour as OverrideBehaviour
      );

      expect(state._overrides.get(endpointId).size).toBe(1);
      expect(state._overrides.get(endpointId).get(overrideId)).toBe(
        overrideBehaviour
      );
    });
  });

  describe(`#setActiveOverride`, () => {
    it(`should set the active override`, () => {
      const endpointId = 'home';
      const overrideId = '404';

      state.setActiveOverride(endpointId, overrideId);

      expect(state._activeOverrides.get(endpointId)).toBe(overrideId);
    });
  });

  describe(`#getActiveOverrideId`, () => {
    const endpointId = 'home';
    const overrideId = '404';

    beforeEach(() => {
      state._activeOverrides = new Map().set(endpointId, overrideId);
    });

    it(`should return the active overrideId if it there is one`, () => {
      expect(state.getActiveOverrideId(endpointId)).toEqual(overrideId);
    });

    it(`should return null if the endpoint has no active override`, () => {
      expect(
        state.getActiveOverrideId('endpoint with no active overrides')
      ).toBeNull();
    });
  });

  describe(`#getActiveOverrideBehaviour`, () => {
    const endpointId = 'home';
    const endpointId2 = 'account';
    const overrideId = '404';
    const overrideBehaviour = { status: 200 };

    beforeEach(() => {
      state._overrides = new Map().set(
        endpointId,
        new Map().set(overrideId, overrideBehaviour)
      );
      state._activeOverrides = new Map()
        .set(endpointId, overrideId)
        .set(endpointId2, overrideId);
    });

    it(`should return the active override behaviour if there is one`, () => {
      expect(state.getActiveOverrideBehaviour(endpointId)).toBe(
        overrideBehaviour
      );
    });

    it(`should return null when the endpoint has no active override`, () => {
      expect(
        state.getActiveOverrideBehaviour('endpointWithoutActiveOverrides')
      ).toBeNull();
    });

    it(`should return null when the override has no registered behaviour`, () => {
      expect(state.getActiveOverrideBehaviour(endpointId2)).toBeNull();
    });
  });
});
