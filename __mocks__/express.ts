import { Mock } from 'vitest';

export const mockExpressFunctions = {
  use: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  listen: vi.fn(),
};
export const mockExpressStatic = vi.fn(() => 'static');

const mockExpress: Mock & { static?: Mock } = vi.fn(() => mockExpressFunctions);
mockExpress.static = mockExpressStatic;

export default mockExpress;
