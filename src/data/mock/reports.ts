import { Report } from '@/types';
import { daysAgo, hoursAgo } from './time';

export function createMockReports(now: Date = new Date()): Report[] {
  return [
    {
      id: 'rep-001', reporterId: 'psg-003', reporterRole: 'passenger', subjectId: 'drv-009', subjectRole: 'driver',
      category: 'no_helmet', severity: 'high', status: 'under_review',
      description: 'Driver did not offer a passenger helmet and said none was available. This is the second time with the same driver.',
      createdAt: daysAgo(6, 19, now),
      notes: [{ id: 'note-001', author: 'Demo Admin', body: 'Matches an earlier report from last month. Driver suspended pending review.', createdAt: daysAgo(5, 10, now) }],
      history: [{ id: 'h-001', from: 'open', to: 'under_review', by: 'Demo Admin', at: daysAgo(5, 10, now) }],
    },
    {
      id: 'rep-002', reporterId: 'drv-002', reporterRole: 'driver', subjectId: 'psg-004', subjectRole: 'passenger',
      category: 'harassment', severity: 'high', status: 'resolved',
      description: 'Passenger sent repeated abusive messages after the driver declined a trip outside Kigali.',
      createdAt: daysAgo(9, 21, now), notes: [],
      history: [
        { id: 'h-002', from: 'open', to: 'under_review', by: 'Demo Admin', at: daysAgo(9, 22, now) },
        { id: 'h-003', from: 'under_review', to: 'resolved', by: 'Demo Admin', reason: 'Passenger account suspended.', at: daysAgo(8, 20, now) },
      ],
    },
    {
      id: 'rep-003', reporterId: 'psg-001', reporterRole: 'passenger', subjectId: 'drv-008', subjectRole: 'driver',
      category: 'overcharging', severity: 'medium', status: 'open',
      description: 'Agreed on 800 RWF from Kimironko to Remera, driver asked for 1,500 RWF on arrival.',
      createdAt: hoursAgo(10, now), notes: [], history: [],
    },
    {
      id: 'rep-004', reporterId: 'psg-010', reporterRole: 'passenger', subjectId: 'drv-004', subjectRole: 'driver',
      category: 'unsafe_riding', severity: 'medium', status: 'open',
      description: 'Driver was speeding on KN 5 Rd and overtaking between buses.',
      createdAt: daysAgo(1, 9, now), notes: [], history: [],
    },
    {
      id: 'rep-005', reporterId: 'psg-002', reporterRole: 'passenger', subjectId: 'drv-003', subjectRole: 'driver',
      category: 'no_show', severity: 'low', status: 'dismissed',
      description: 'Driver agreed on the phone to pick me up but never arrived.',
      createdAt: daysAgo(27, 11, now),
      notes: [{ id: 'note-002', author: 'Demo Admin', body: 'Driver called back within 5 minutes to cancel. No further action.', createdAt: daysAgo(26, 9, now) }],
      history: [{ id: 'h-004', from: 'open', to: 'dismissed', by: 'Demo Admin', reason: 'Trip cancelled by phone; not a no-show.', at: daysAgo(26, 9, now) }],
    },
    {
      id: 'rep-006', reporterId: 'psg-007', reporterRole: 'passenger', subjectId: 'drv-005', subjectRole: 'driver',
      category: 'other', severity: 'low', status: 'open',
      description: 'Profile photo looks different from the driver who arrived. Could be a borrowed account.',
      createdAt: daysAgo(2, 15, now), notes: [], history: [],
    },
    {
      id: 'rep-007', reporterId: 'drv-001', reporterRole: 'driver', subjectId: 'psg-009', subjectRole: 'passenger',
      category: 'other', severity: 'low', status: 'resolved',
      description: 'Passenger left a bag on the motorcycle. Returned the next day.',
      createdAt: daysAgo(19, 18, now), notes: [],
      history: [{ id: 'h-005', from: 'open', to: 'resolved', by: 'Demo Admin', reason: 'Item returned to passenger.', at: daysAgo(18, 9, now) }],
    },
  ];
}
