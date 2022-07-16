const setActiveOverrideMock = jest.fn();
const endpointExistsMock = jest.fn();
const addEndpointMock = jest.fn();
const overrideExistsMock = jest.fn();
const addOverrideMock = jest.fn();
const getActiveOverrideIdMock = jest.fn();
const getActiveOverrideBehaviourMock = jest.fn();

export const StubsyState = {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  getInstance: jest.fn(() => {
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
