/**
 * Moto Discovery palette: dark forest green on white.
 * Green carries brand, primary actions and "available" status.
 * Everything else stays neutral so status colours remain meaningful.
 */
export const colors = {
  primary: '#0B4F33',
  primaryPressed: '#073822',
  primaryTint: '#E7F1EB',
  primaryTintStrong: '#CFE3D7',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#B9D4C4',

  background: '#FFFFFF',
  surface: '#F4F8F5',
  border: '#D9E4DD',
  borderStrong: '#B8C9BF',

  text: '#0F2A1D',
  textMuted: '#55685D',
  textFaint: '#7F9087',

  success: '#0B4F33',
  successTint: '#E7F1EB',
  warning: '#8A5300',
  warningTint: '#FFF3DC',
  danger: '#B42318',
  dangerTint: '#FDECEA',
  info: '#1D4E89',
  infoTint: '#E8F0FA',
  neutral: '#55685D',
  neutralTint: '#EEF2EF',

  mapLand: '#EEF4F0',
  mapRoad: '#FFFFFF',
  mapWater: '#D6E6F2',
  overlay: 'rgba(7, 56, 34, 0.45)',
} as const;

export type ColorToken = keyof typeof colors;
