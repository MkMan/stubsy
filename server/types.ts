export type EndpointId = string;

export type OverrideId = string;

export type EndpointBehaviour = {
  path: string;
  responseBody: unknown;
  status: 200 | 404 | 500;
  type: 'get' | 'post' | 'put' | 'delete';
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
