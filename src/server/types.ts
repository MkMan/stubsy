export type EndpointId = string;

export type OverrideId = string;

export type EndpointBehaviour = {
  path: string;
  responseBody: unknown;
  status: number;
  type: 'get' | 'post' | 'put' | 'delete' | 'patch';
};

export type OverrideBehaviour = Pick<
  EndpointBehaviour,
  'status' | 'responseBody'
>;

export type ConfigPayload = {
  endpointId: EndpointId;
  overrideId: OverrideId;
  isActive: boolean;
};

export type ConfigResponseEntry = {
  endpointId: EndpointId;
  path: EndpointBehaviour['path'];
  type: EndpointBehaviour['type'];
  overrides: { overrideId: OverrideId; isActive: boolean }[];
};

export type StubsyEndpoints = Map<EndpointId, EndpointBehaviour>;
export type StubsyOverrides = Map<
  EndpointId,
  Map<OverrideId, OverrideBehaviour>
>;
export type StubsyActiveOverrides = Map<EndpointId, OverrideId>;
