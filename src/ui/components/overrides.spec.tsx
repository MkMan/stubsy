import React from 'react';

import { ConfigResponseEntry as EndpointConfig } from '../../server/types';
import { act, render, screen } from '../test-utils';
import { Overrides } from './overrides';

describe(`Overrides`, () => {
  const overrides: EndpointConfig['overrides'] = [
    { overrideId: '200', isActive: false },
  ];
  const onOverrideChange = vi.fn();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TestBed = (props: any) => (
    <Overrides
      endpointId="test-endpoint"
      isExpanded={true}
      onOverrideChange={onOverrideChange}
      overrides={overrides}
      {...props}
    />
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show the correct number of radio buttons', () => {
    render(<TestBed />);

    const radioButtons = screen.getAllByRole('radio');

    expect(radioButtons.length).toBe(overrides.length + 1);
  });

  it('should pre-select the default behaviour if none of the overrides are selected', () => {
    render(<TestBed />);

    const defaultBehaviour = screen.getByRole('radio', { name: 'Default' });

    expect(defaultBehaviour).toBeChecked();
  });

  it('should pre-select the active override', () => {
    render(
      <TestBed
        overrides={[...overrides, { overrideId: '500', isActive: true }]}
      />,
    );

    const activeOverride = screen.getByRole('radio', { name: '500' });

    expect(activeOverride).toBeChecked();
  });

  it('should call the onOverrideChange function when the user changes overrides', () => {
    render(<TestBed />);

    const overrideToActivate = screen.getByRole('radio', { name: '200' });

    act(() => {
      overrideToActivate.click();
    });

    expect(onOverrideChange).toHaveBeenCalledWith('200');
  });
});
