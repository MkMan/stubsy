export const mockExpressFunctions = {
  use: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  listen: jest.fn(),
};
export const mockExpressStatic = jest.fn(() => 'static');

const mockExpress = jest.fn(() => mockExpressFunctions);
(mockExpress as any).static = mockExpressStatic;

export default mockExpress;
