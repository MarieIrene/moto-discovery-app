import { AccountStatus, ReportCategory, ReportSeverity, ReportStatus, VerificationStatus } from '@/types';

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  pending: 'Pending review',
  approved: 'Verified',
  rejected: 'Rejected',
};

export const ACCOUNT_LABEL: Record<AccountStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  open: 'Open',
  under_review: 'Under review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

export const SEVERITY_LABEL: Record<ReportSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const CATEGORY_LABEL: Record<ReportCategory, string> = {
  unsafe_riding: 'Unsafe riding',
  no_helmet: 'No passenger helmet',
  overcharging: 'Overcharging',
  harassment: 'Harassment',
  no_show: 'Did not arrive',
  other: 'Other',
};
