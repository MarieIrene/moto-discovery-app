import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export interface OnboardingSlide {
  key: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  { key: 'find', icon: 'location', title: 'See who is free nearby', body: 'Moto Discovery shows available motorcycle taxi drivers around you, on a map or as a list.' },
  { key: 'call', icon: 'call', title: 'Call the driver directly', body: 'Agree on pickup and price with the driver on the phone. No middleman, no in-app payment.' },
  { key: 'drive', icon: 'bicycle', title: 'Drive? Go online when ready', body: 'Drivers switch availability on and off so passengers only see people who can take a trip.' },
];
