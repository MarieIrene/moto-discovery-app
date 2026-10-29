import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { DriverCard } from '@/components/drivers/DriverCard';
import { Button, ConfirmDialog, EmptyState, StatusBadge, VerificationBadge } from '@/components/ui';
import { createMockDrivers } from '@/data/mock/drivers';

describe('Button', () => {
  it('calls onPress and exposes an accessible label', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save changes" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire while loading', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save" onPress={onPress} loading testID="btn" />);
    await fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('status badges', () => {
  it('renders text, not just colour', async () => {
    await render(<StatusBadge label="Suspended" tone="danger" />);
    expect(screen.getByText('Suspended')).toBeTruthy();
  });

  it('maps verification status to a readable label', async () => {
    await render(<VerificationBadge status="pending" />);
    expect(screen.getByText('Pending review')).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('offers a next step', async () => {
    const onPress = jest.fn();
    await render(<EmptyState title="No drivers in this area" action={{ label: 'Search within 25 km', onPress }} />);
    await fireEvent.press(screen.getByText('Search within 25 km'));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('ConfirmDialog', () => {
  it('requires a valid reason before confirming', async () => {
    const onConfirm = jest.fn();
    await render(
      <ConfirmDialog visible title="Suspend this driver?" message="..." confirmLabel="Suspend" reasonLabel="Reason for suspending" onConfirm={onConfirm} onCancel={jest.fn()} />,
    );
    await fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText('Give a reason of at least 10 characters')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('confirm-reason'), 'Repeated helmet complaints');
    await fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));
    expect(onConfirm).toHaveBeenCalledWith('Repeated helmet complaints');
  });
});

describe('DriverCard', () => {
  const driver = { ...createMockDrivers()[0]!, distanceKm: 0.4 };

  it('shows name, distance and a call action for available drivers', async () => {
    const onPress = jest.fn();
    const onCall = jest.fn();
    await render(<DriverCard driver={driver} onPress={onPress} onCall={onCall} />);
    expect(screen.getByText('Jean Claude Habimana')).toBeTruthy();
    expect(screen.getByText('400 m')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Call Jean Claude Habimana' }));
    expect(onCall).toHaveBeenCalled();
  });

  it('hides the call button for offline drivers', async () => {
    await render(<DriverCard driver={{ ...driver, isAvailable: false }} onPress={jest.fn()} onCall={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Call Jean Claude Habimana' })).toBeNull();
    expect(screen.getByText('Offline')).toBeTruthy();
  });
});
