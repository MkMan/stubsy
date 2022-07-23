const setActiveOverrideMock = vi.fn();
const endpointExistsMock = vi.fn();
const addEndpointMock = vi.fn();
const overrideExistsMock = vi.fn();
const addOverrideMock = vi.fn();
const getActiveOverrideIdMock = vi.fn();
const getActiveOverrideBehaviourMock = vi.fn();

export const StubsyState = {
  getInstance: vi.fn(() => {
    return {
      setActiveOverride: setActiveOverrideMock,
      endpointExists: endpointExistsMock,
      addEndpoint: addEndpointMock,
      overrideExists: overrideExistsMock,
      addOverride: addOverrideMock,
      getActiveOverrideId: getActiveOverrideIdMock,
      getActiveOverrideBehaviour: getActiveOverrideBehaviourMock,
    };
  }),
};
