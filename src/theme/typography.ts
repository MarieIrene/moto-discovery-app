import { TextStyle } from 'react-native';

/** Modular scale (~1.2) on the platform system font. */
export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.2 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
