export const mockExpressFunctions = {
  use: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  listen: jest.fn(),
};
export const mockExpressStatic = jest.fn(() => 'static');

const mockExpress: jest.Mock & { static?: jest.Mock } = jest.fn(
  () => mockExpressFunctions
);
mockExpress.static = mockExpressStatic;

export default mockExpress;
