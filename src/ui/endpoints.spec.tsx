/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { Endpoints } from './endpoints';

jest.mock('./endpoint', () => ({
  Endpoint: () => <p data-testid="endpoint">Mock Endpoint</p>,
}));

describe(`Endpoints`, () => {
  const serverResponse = [
    { endpointId: '1' },
    { endpointId: '2' },
    { endpointId: '3' },
  ];

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(serverResponse),
    });
  });

  it(`should fetch the server config`, async () => {
    await act(async () => {
      render(<Endpoints />);
    });

    expect(global.fetch).toHaveBeenCalledWith('/Stubsy/Config');
  });

  it(`should render the correct number of endpoints`, async () => {
    await act(async () => {
      render(<Endpoints />);
    });

    const endpointComponents = screen.getAllByTestId('endpoint');

    expect(endpointComponents.length).toEqual(serverResponse.length);
  });
});
