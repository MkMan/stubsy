module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['index.*'],
  testPathIgnorePatterns: ['/node_modules/', '/dist'],
};
